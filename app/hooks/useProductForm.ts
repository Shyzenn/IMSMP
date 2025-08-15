import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";

export function useProductForm<T extends FieldValues>(
  setError: UseFormSetError<T>,
  onSuccess?: () => void
) {
  const router = useRouter();

  const handleErrors = useCallback((errors: Record<string, string>) => {
    Object.entries(errors).forEach(([field, message]) => {
      setError(field as Path<T>, {
        type: "server",
        message,
      });
    });
  }, [setError]);

  const handleSubmitWrapper = useCallback(async (
    submitFn: () => Promise<{ success?: boolean; errors?: Record<string, string> }>,
  ) => {
    try {
      const response = await submitFn();
      if (response.errors) {
        handleErrors(response.errors);
      } else if (response.success) {
        onSuccess?.();
        router.refresh();
      }
    } catch (error) {
      try {
        const errorData = JSON.parse((error as Error).message);
        if (errorData.errors) handleErrors(errorData.errors);
        else alert("Unexpected error occurred.");
      } catch {
        alert("Unexpected error occurred.");
      }
    }
  }, [handleErrors, onSuccess, router]);

  return { handleSubmitWrapper };
}
