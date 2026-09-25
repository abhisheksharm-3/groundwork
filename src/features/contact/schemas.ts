/** What a contact message must be before anything reads it. The messages are the copy shown beside each field. */
import { z } from "zod";

export const MESSAGE_MAX = 2000;

export const ContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tell us your name.")
    .max(120, "Keep your name under 120 characters."),
  email: z.email("Enter an email address we can reply to."),
  message: z
    .string()
    .trim()
    .min(1, "Write a message.")
    .max(MESSAGE_MAX, "Keep the message under 2,000 characters."),
  website: z.string().max(0),
});
