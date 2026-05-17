import fs from "fs"
import path from "path"
import mjml from "mjml"

export const renderMjml = (
  templateName: string,
  variables: Record<string, string>
): string => {
  const templatePath = path.join(
    __dirname,
    "templates",
    `${templateName}.mjml`
  )

  let template = fs.readFileSync(templatePath, "utf-8")

  for (const [key, value] of Object.entries(variables)) {
    template = template.replace(
      new RegExp(`{{${key}}}`, "g"),
      value
    )
  }

  const { html, errors } = mjml(template)

  if (errors?.length) {
    throw new Error(errors[0].message)
  }

  return html
}
