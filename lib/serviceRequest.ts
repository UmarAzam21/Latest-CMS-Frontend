export type ServiceRequest = {
	serviceName: string;
	username: string;
	email: string;
	cnic: string;
	cnicPhoto: string;
	certificateFront: string;
	certificateBack: string;
	submittedAt: string;
};

const SERVICE_REQUEST_KEY = "filernow-service-request";

export function saveServiceRequest(request: ServiceRequest) {
	localStorage.setItem(SERVICE_REQUEST_KEY, JSON.stringify(request));
}

export function getServiceRequest(): ServiceRequest | null {
	const storedRequest = localStorage.getItem(SERVICE_REQUEST_KEY);
	if (!storedRequest) return null;

	try {
		return JSON.parse(storedRequest) as ServiceRequest;
	} catch {
		return null;
	}
}