// Custom hook to extract error message from an error object or string.
export function useError(error: unknown): string {
	let _error: string;

	if (error instanceof Error) {
		// If 'error' is an instance of 'Error', extract the error message.
		_error = error.message;
	} else if (typeof error === "string") {
		// If 'error' is a string, use it as the error message.
		_error = error;
	} else {
		// If 'error' is of an unexpected type, set a default error message.
		_error = "Unknown error";
	}

	return _error;
}
