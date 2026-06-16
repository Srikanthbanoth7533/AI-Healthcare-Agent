from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel

from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel

from pdf2image import convert_from_path
import pytesseract

from PIL import Image

from fastapi.responses import FileResponse
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet



import os
import platform
import uuid

# =========================
# LOAD ENV VARIABLES
# =========================

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

# =========================
# GROQ CLIENT
# =========================

client = Groq(api_key=api_key)

# =========================
# FASTAPI APP
# =========================

app = FastAPI()
latest_report_content = "No report generated yet."

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# UPLOAD FOLDER
# =========================

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# =========================
# TESSERACT & POPPLER PATHS
# =========================

is_windows = platform.system() == "Windows"

if is_windows:
    pytesseract.pytesseract.tesseract_cmd = (
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    )
    POPPLER_PATH = r"C:\poppler\Library\bin"
else:
    # On Render/Linux, they are installed globally in system PATH
    POPPLER_PATH = None

# =========================
# REQUEST MODEL
# =========================

class ChatRequest(BaseModel):
    message: str

# =========================
# HOME ROUTE
# =========================

@app.get("/")
def home():

    return {
        "message": "AI Healthcare Assistant Running Successfully"
    }

# =========================
# CHAT API
# =========================

@app.post("/chat")
def healthcare_chat(request: ChatRequest):

    try:

        response = client.chat.completions.create(

            model="llama-3.1-8b-instant",

            messages=[

                {
                    "role": "system",
                    "content": (
                        "You are an advanced AI Healthcare Assistant. "
                        "Provide safe and professional healthcare advice. "
                        "Do not prescribe dangerous medicines. "
                        "Suggest healthy lifestyle improvements."
                    )
                },

                {
                    "role": "user",
                    "content": request.message
                }

            ]

        )

        return {
            "reply": response.choices[0].message.content
        }

    except Exception as e:

        return {
            "reply": f"Error: {str(e)}"
        }

# =========================
# PDF ANALYSIS ROUTE
# =========================

@app.post("/analyze-report/")
async def analyze_report(file: UploadFile = File(...)):

    try:

        # =========================
        # FILE VALIDATION
        # =========================

        if not file.filename.endswith(".pdf"):

            return {
                "medical_analysis":
                "Please upload only PDF files."
            }

        # =========================
        # SAVE FILE
        # =========================

        unique_name = f"{uuid.uuid4()}.pdf"

        file_path = os.path.join(
            UPLOAD_FOLDER,
            unique_name
        )

        with open(file_path, "wb") as f:

            f.write(await file.read())

        # =========================
        # OCR EXTRACTION
        # =========================

        extracted_text = ""

        if POPPLER_PATH:
            pages = convert_from_path(
                file_path,
                dpi=300,
                poppler_path=POPPLER_PATH
            )
        else:
            pages = convert_from_path(
                file_path,
                dpi=300
            )

        print(f"\nTotal Pages: {len(pages)}")

        for index, page in enumerate(pages):

            # Convert image to RGB
            page = page.convert("RGB")

            # OCR
            text = pytesseract.image_to_string(
                page,
                config="--psm 6"
            )

            print(f"\n===== PAGE {index + 1} =====\n")

            print(text[:1500])

            extracted_text += text + "\n"

        # =========================
        # CHECK TEXT
        # =========================

        if len(extracted_text.strip()) < 50:

            return {
                "medical_analysis":
                "Unable to extract readable text from report. "
                "Please upload a clearer scan."
            }

        # Remove duplicate newlines and spaces to compress token usage
        import re
        cleaned_text = re.sub(r'\n+', '\n', extracted_text)
        cleaned_text = re.sub(r' {2,}', ' ', cleaned_text)
        cleaned_text = cleaned_text.strip()

        # Limit text length to avoid Groq's 6,000 TPM rate limit (8000 chars is ~1500-2000 tokens)
        if len(cleaned_text) > 8000:
            cleaned_text = cleaned_text[:8000] + "\n\n[Report content truncated due to size limits]..."

        # =========================
        # AI ANALYSIS
        # =========================

        response = client.chat.completions.create(

            model="llama-3.1-8b-instant",

            messages=[

                {
                    "role": "system",
                    "content": (
                        "You are a professional AI medical report analyzer. "
                        "Analyze blood reports and pathology reports carefully. "
                        "Identify abnormal values. "
                        "Explain possible health risks. "
                        "Suggest diet improvements, hydration, exercise, "
                        "lifestyle changes, and precautions. "
                        "Never prescribe dangerous medicines."
                    )
                },

                {
                    "role": "user",
                    "content": f"""

Analyze this medical report carefully.

MEDICAL REPORT:

{cleaned_text}

Provide response in this format:

1. Important Abnormal Findings
2. Possible Diseases or Risks
3. Diet Recommendations
4. Exercise Recommendations
5. Lifestyle Improvements
6. Precautions
7. Doctor Consultation Advice

"""
                }

            ]

        )
        global latest_report_content

        final_response = response.choices[0].message.content

        latest_report_content = final_response
        
    

        return {

            "medical_analysis": final_response

            }
    
    
        
    
    except Exception as e:

        print("\nERROR:", str(e))

        return {
            "medical_analysis":
            f"Error analyzing report: {str(e)}"
        }

    

# =========================
# AI TEST
# =========================

@app.get("/ai-test")
def ai_test():

    try:

        response = client.chat.completions.create(

            model="llama-3.1-8b-instant",

            messages=[

                {
                    "role": "user",
                    "content":
                    "Give 5 health tips for students."
                }

            ]

        )

        return {
            "response":
            response.choices[0].message.content
        }

    except Exception as e:

        return {
            "response":
            f"Error: {str(e)}"
        }

from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet


@app.post("/generate-pdf/")
async def generate_pdf():

    global latest_report_content

    pdf_file = "AI_Report.pdf"

    doc = SimpleDocTemplate(pdf_file)

    styles = getSampleStyleSheet()

    content = [

        Paragraph(
            "AI Healthcare Report",
            styles["Title"]
        ),

        Paragraph(
            latest_report_content.replace(
                "\n",
                "<br/>"
            ),
            styles["BodyText"]
        ),

    ]

    doc.build(content)

    return FileResponse(
        pdf_file,
        media_type="application/pdf",
        filename="AI_Report.pdf"
    )
# ==========================
# DISEASE PREDICTION
# ==========================

class DiseaseRequest(BaseModel):
    symptoms: str


@app.post("/predict-disease")
async def predict_disease(request: DiseaseRequest):

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a medical AI assistant. "
                    "Based on symptoms provide:\n"
                    "1. Most likely disease\n"
                    "2. Explanation\n"
                    "3. Diet suggestions\n"
                    "4. Precautions\n"
                    "5. Lifestyle recommendations\n"
                    "6. prescribe medicines."
                )
            },
            {
                "role": "user",
                "content": f"Symptoms: {request.symptoms}"
            }
        ]
    )

    return {
        "prediction":
        response.choices[0].message.content
    }


@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...)):
    try:
        allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
        _, ext = os.path.splitext(file.filename.lower())
        if ext not in allowed_extensions:
            return {
                "analysis": "Please upload only image files (JPG, JPEG, PNG, WEBP)."
            }

        contents = await file.read()
        
        import base64
        base64_image = base64.b64encode(contents).decode("utf-8")
        
        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert AI dermatological and wound analysis assistant. "
                        "Analyze the skin or wound image carefully. Identify signs of infection, scars, wounds, rashes, or other conditions. "
                        "Provide a structured analysis:\n"
                        "1. Visual Findings (describe the lesion, rash, wound, or scar)\n"
                        "2. Possible Condition or Risks (explain potential causes, but explain this is a preliminary check)\n"
                        "3. First-Aid & Immediate Care (basic hygiene, wound dressing, cleaning, or hydration)\n"
                        "4. Precautions & Things to Avoid (e.g. scratching, picking, applying certain irritants)\n"
                        "5. Lifestyle & Prevention (nutrition, hygiene, skin protection)\n"
                        "6. Red Flag Symptoms (when to seek immediate emergency care)\n"
                        "7. Doctor Consultation Advice.\n"
                        "Never prescribe prescription medications or guarantee a final medical diagnosis."
                    )
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this skin/wound image carefully and provide the structured report."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ]
        )
        
        return {
            "analysis": response.choices[0].message.content
        }
        
    except Exception as e:
        print("\nIMAGE ANALYSIS ERROR:", str(e))
        return {
            "analysis": f"Error analyzing image: {str(e)}"
        }