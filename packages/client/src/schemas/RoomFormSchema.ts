import { z } from "zod";

export const RoomFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Room name must be at least 3 characters")
        .max(50, "Room name must be under 50 characters"),

    tagline: z
        .string()
        .trim()
        .min(5, "Tagline must be at least 5 characters")
        .max(120, "Tagline must be under 120 characters"),

    topics: z
        .string()
        .trim()
        .min(1, "At least one tag is required")
        .refine((val) => {
            const topics = val
                .split(",")
                .map(t => t.trim())
                .filter(Boolean)

            return topics.length > 0
        }, "Enter at least one valid tag")

        .refine((val) => {
            const topics = val
                .split(",")
                .map(t => t.trim())
                .filter(Boolean)

            return topics.length <= 10
        }, "Maximum 10 topics allowed")

        .refine((val) => {
            const topics = val
                .split(",")
                .map(t => t.trim().toLowerCase())
                .filter(Boolean)

            return new Set(topics).size === topics.length
        }, "Duplicate topics are not allowed")

        .refine((val) => {
            const topics = val
                .split(",")
                .map(t => t.trim())

            return topics.every(tag => tag.length >= 1 && tag.length <= 20)
        }, "Each tag must be 1-20 characters long")

        .transform((val) =>
            val
                .replace(/,+/g, ",")
                .split(",")
                .map(t => t.trim().toLowerCase())
                .filter(Boolean)
                .join(", ")
        ),

    image: z.instanceof(FileList).optional(),

    access_type: z
        .enum(["public", "private"])
});

export type RoomFormValues = z.infer<typeof RoomFormSchema>