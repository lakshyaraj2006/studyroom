import { useRef } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Field,
    FieldLabel,
    FieldDescription,
    FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AxiosError } from "axios"
import axiosInstance from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { type ServerResponse } from "@/interfaces/server-response"
import { useNavigate } from "react-router-dom"
import type { Room } from "@/interfaces/room"
import { toast } from "sonner"
import { Loader2Icon, PlusIcon } from "lucide-react"
import { RoomFormSchema, type RoomFormValues } from "@/schemas/RoomFormSchema"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"

// helper
function getError(error: any) {
    return error ? [error] : []
}

// Room form props
export type RoomFormProps = {
    initialData?: RoomFormValues | undefined
}

export default function RoomForm({ initialData }: RoomFormProps) {
    const { authToken } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<RoomFormValues>({
        resolver: zodResolver(RoomFormSchema),
        mode: "all",
        defaultValues: {
            name: initialData?.name || "",
            tagline: initialData?.tagline || "",
            topics: initialData?.topics || "",
            access_type: initialData?.access_type ?? "public",
            image: undefined,
        },
    })

    const onSubmit = async (data: RoomFormValues) => {
        if (isSubmitting) return

        try {
            const formData = new FormData()

            formData.append("name", data.name)
            formData.append("tagline", data.tagline)

            const formattedTopics = data.topics.replace(/,+/g, ",")
                .split(",")
                .map(t => t.trim().toLowerCase())
                .filter(Boolean)

            formData.append("topics", JSON.stringify(formattedTopics))

            const file = data.image?.[0]
            if (file) {
                formData.append("image", file)
            }

            formData.append("access_type", data.access_type)

            const response = await axiosInstance.post<ServerResponse<Room>>(
                "/rooms/create",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            )

            const { success, message } = response.data

            success ? toast.success(message) : toast.error(message)

            if (success) {
                reset()
                navigate("/rooms")
            }
        } catch (error: any) {
            if (error instanceof AxiosError) {
                toast.error(error?.response?.data?.message)
            } else {
                toast.error(error.message)
            }
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Room Name</FieldLabel>
                <Input
                    id="name"
                    placeholder="e.g. DSA Prep Room"
                    {...register("name")}
                    aria-invalid={!!errors.name}
                />
                <FieldError errors={getError(errors.name)} />
            </Field>

            <Field data-invalid={!!errors.topics}>
                <FieldLabel htmlFor="topics">Room Tags</FieldLabel>
                <Input
                    id="topics"
                    placeholder="python, java, node"
                    {...register("topics")}
                    aria-invalid={!!errors.topics}
                />
                <FieldDescription>
                    Separate topics with commas
                </FieldDescription>
                <FieldError errors={getError(errors.topics)} />
            </Field>

            <Field>
                <FieldLabel htmlFor="image">Room Image</FieldLabel>

                <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    {...register("image")}
                    ref={(e) => {
                        register("image").ref(e)
                        fileInputRef.current = e
                    }}
                />

                <FieldDescription>
                    Optional. Upload a cover image for your room.
                </FieldDescription>
            </Field>

            <Field>
                <FieldLabel>Access Type</FieldLabel>

                <Controller
                    control={control}
                    name="access_type"
                    render={({ field }) => (
                        <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="flex gap-4"
                        >
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="public" id="public" />
                                <label htmlFor="public" className="text-sm">
                                    Public
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="private" id="private" />
                                <label htmlFor="private" className="text-sm">
                                    Private
                                </label>
                            </div>
                        </RadioGroup>
                    )}
                />

                <FieldDescription>
                    Defaults to public if not changed
                </FieldDescription>
            </Field>

            <Field data-invalid={!!errors.tagline}>
                <FieldLabel htmlFor="tagline">Room Tagline</FieldLabel>
                <Input
                    id="tagline"
                    placeholder="A place to grind DSA daily"
                    {...register("tagline")}
                    aria-invalid={!!errors.tagline}
                />
                <FieldError errors={getError(errors.tagline)} />
            </Field>

            <Button type="submit" className="flex items-center justify-center gap-2 w-full" disabled={isSubmitting}>
                {
                    isSubmitting
                        ? <><Loader2Icon className="animate-spin" /> <p>Creating Room...</p></>
                        : <><PlusIcon /> <p>Create Room</p></>
                }
            </Button>
        </form>
    )
}