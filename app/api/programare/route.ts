import { handleFormRequest } from "@/lib/form-handler";

// Primește cererile de programare (POST /api/programare). Programarea se confirmă telefonic.
export async function POST(request: Request) {
  return handleFormRequest(request, "programare");
}
