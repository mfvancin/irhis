import smtplib
from email.message import EmailMessage

def send_reset_email(email: str, reset_link: str):
    msg = EmailMessage()
    msg["Subject"] = "Reset Your Password"
    msg["From"] = "noreply@yourapp.com"
    msg["To"] = email
    msg.set_content(f"Click the link to reset your password: {reset_link}")

    with smtplib.SMTP("smtp.yourprovider.com", 587) as smtp:
        smtp.starttls()
        smtp.login("your_email", "your_password")
        smtp.send_message(msg)

