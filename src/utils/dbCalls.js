const API_URL = process.env.NEXT_PUBLIC_API_URL;
const XDeviceId = process.env.NEXT_PUBLIC_XDEVICEID;

export const fetchCurrencies = async () => {
	try {
		const response = await fetch(`${API_URL}/currencies/`, {
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: "Basic",
				"X-Device-Id": `${XDeviceId}`,
			},
		});
		if (!response.ok) {
			throw new Error("Error fetching currencies");
		}
		return await response.json();
	} catch (error) {
		console.error("Error:", error);
		throw error;
	}
};

export const createPayment = async ({ amount, crypto, concept }) => {
	try {
		const response = await fetch(`${API_URL}/orders/`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				Authorization: "Basic",
				"X-Device-Id": `${XDeviceId}`,
			},
			body: JSON.stringify({
				expected_output_amount: amount,
				input_currency: crypto.blockchain,
				reference: concept,
			}),
		});
		if (!response.ok) {
			throw new Error("Error creating payment");
		}
		return await response.json();
	} catch (error) {
		console.error("Error:", error);
		throw error;
	}
};

export const fetchOrderInfo = async (identifier) => {
	try {
		const response = await fetch(`${API_URL}/orders/info/${identifier}/`, {
			headers: {
				Accept: "application/json",
				Authorization: "Basic",
				"X-Device-Id": `${XDeviceId}`,
			},
		});

		if (!response.ok) {
			throw new Error("Error al obtener la información del pago");
		}

		return await response.json();
	} catch (error) {
		console.error("Error en fetchOrderInfo:", error);
		throw error;
	}
};
