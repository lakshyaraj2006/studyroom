import { Contact } from "./contact.model";
import { ApiError } from "@/core/errors/ApiError";
import { sendContactEmail } from "@/jobs/emails/sendContactEmail";

const sendContactMessage = async (
    name: string,
    email: string,
    subject: string,
    message: string
) => {
    if (!name || !name.trim()) {
        throw new ApiError(400, "Name is a required field!");
    }
    if (!email || !email.trim()) {
        throw new ApiError(400, "Email is a required field!");
    }
    if (!message || !message.trim()) {
        throw new ApiError(400, "Message content is required!");
    }

    const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Please enter a valid email address!");
    }

    const contact = new Contact({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject ? subject.trim() : undefined,
        message: message.trim()
    });

    await contact.save();

    // Send email notification to admin asynchronously (don't block the request)
    sendContactEmail(
        contact.name,
        contact.email,
        contact.subject || "",
        contact.message
    ).catch((err) => {
        console.error("Failed to send contact notification email:", err);
    });

    return contact;
};

export const contactService = { sendContactMessage };
