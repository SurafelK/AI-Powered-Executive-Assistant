import { GoogleGenerativeAI } from "@google/generative-ai";
import nodemailer, { Transporter } from "nodemailer";
import dns from "dns";
const apiKey = 'AIzaSyDaSupt3TwoMozaqtlL3ezzjHYGK5fmeA0' ; // Replace with your actual API key

if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined.");
  throw new Error("GEMINI_API_KEY is not defined.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiResponse = async (subject: string, body: string, from: string) => {
  try {
    console.log(body);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `Subject: ${subject}\nBody from ${from}:\n ${body}\n\nPlease provide a professional response to the message above. Keep it concise and structured in a formal email format.`;

    const result = await model.generateContent(prompt);
    
    if (!result || !result.response) {
      throw new Error("No response received from the model.");
    }

    const text = await result.response.text();
    
    console.log(text);
    return text || "No response received.";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "An error occurred while generating the response.";
  }
};




interface SMTPSettings {
  host: string;
  ports: number[];
  secure: boolean;
}


// Function to determine SMTP settings based on email domain
const getSMTPPort = (host: string): number[] => {
  const smtpPorts: Record<string, number[]> = {
    "smtp.gmail.com": [587, 465, 25],
    "smtp.office365.com": [587, 25],
    "smtp-mail.outlook.com": [587, 25],
    "smtp.live.com": [587, 25],
    "smtp.yahoo.com": [465, 587],
    "smtp.aol.com": [465, 587],
    "smtp.zoho.com": [587, 465],
    "smtp.mail.com": [465, 587],
    "smtp.fastmail.com": [465, 587],
    "smtp.sendgrid.net": [587, 25],
    "smtp.yandex.com": [465, 587],
    "smtp.protonmail.com": [465, 587],
  };

  return smtpPorts[host] || [587, 465, 25]; // Default ports if host not found
};

export const sendEmail = async (
  from: string,
  to: string,
  emailContent: string,
  host: string,
  pass: string
) => {
  try {
    const { subject, body } = extractEmailParts(emailContent);

    const mailOptions = {
      from: from,
      to: to,
      subject: subject,
      text: body,
    };

    // Create transporter (No need to pass transporter as an argument)
    const transporter = createTransporter(host, from, pass);
    if (!transporter) throw new Error("Failed to create transporter");

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return { success: true, response: info.response };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error };
  }
};

// Function to create a transporter
export const createTransporter = (host: string, user: string, pass: string): Transporter | null => {
  try {
    const ports = getSMTPPort(host);
    const port = ports.includes(587) ? 587 : ports[0]; // Prefer 587, fallback to other ports
    const secure = port === 465; // SSL only for port 465

    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure, // Secure mode based on port
      auth: {
        user: user,
        pass: pass,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error("Transporter verification failed:", error);
      } else {
        console.log(`SMTP connected: ${host} on port ${port} (Secure: ${secure})`);
      }
    });

    return transporter;
  } catch (error) {
    console.error("Error creating transporter:", error);
    return null;
  }
};

// Extract subject and body using a regular expression
const extractEmailParts = (email: string): { subject: string; body: string } => {
  const match = email.match(/^Subject:\s*(.+)\n\n([\s\S]*)$/);
  if (match) {
    return {
      subject: match[1].trim(),
      body: match[2].trim(),
    };
  }
  return { subject: "", body: "" };
};