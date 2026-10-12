import { handleFormRequest } from "@/lib/form-handler";

// Primește mesajele din formularul de contact (POST /api/contact).
export async function POST(request: Request) {
  return handleFormRequest(request, "contact");
}
