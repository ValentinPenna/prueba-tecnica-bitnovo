"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LuCopy, LuCheck, LuClock } from "react-icons/lu";
import { TbInfoHexagonFilled } from "react-icons/tb";
import { fetchOrderInfo, fetchCurrencies } from "../../../utils/dbCalls";
import React from "react";

export default function ResumenPago({ params }) {
	const { identifier } = React.use(params);
	const router = useRouter();

	const [copiedDirection, setCopiedDirection] = useState(false);
	const [copiedValue, setCopiedValue] = useState(false);
	const [copiedTag, setCopiedTag] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [paymentData, setPaymentData] = useState(null);
	const [currencies, setCurrencies] = useState([]);
	const [error, setError] = useState(null);
	const [timeRemaining, setTimeRemaining] = useState(0);
	const [expired, setExpired] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				const data = await fetchOrderInfo(identifier);
				setPaymentData(data[0]);

				// Verificar el estado del pago
				if (data[0].status === "EX" || data[0].status === "OC") {
					router.push("/status/failure");
				} else if (data[0].status === "CO" || data[0].status === "AC") {
					router.push("/status/success");
				}

				// Calcula el tiempo restante
				const expiryTime = new Date(data[0].expired_time).getTime();
				const now = new Date().getTime();
				setTimeRemaining(Math.max(0, Math.floor((expiryTime - now) / 1000)));

				// Establecer el WebSocket
				const socket = new WebSocket(`wss://payments.pre-bnvo.com/ws/${identifier}`);

				socket.onmessage = (event) => {
					const updatedData = JSON.parse(event.data);
					setPaymentData((prevData) => ({
						...prevData,
						...updatedData,
					}));

					// Verificar el nuevo estado del pago
					if (updatedData.status === "EX" || updatedData.status === "OC") {
						router.push("/status/failure");
					} else if (updatedData.status === "CO" || updatedData.status === "AC") {
						router.push("/status/success");
					}
				};

				socket.onerror = (error) => {
					console.error("WebSocket error:", error);
				};

				// Llama a fetchCurrencies para obtener la lista de criptomonedas
				const currenciesData = await fetchCurrencies();
				setCurrencies(currenciesData);

				return () => {
					socket.close();
				};
			} catch (error) {
				console.error("Error al obtener datos:", error);
				setError("No se pudo obtener la información del pago.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [identifier]);

	useEffect(() => {
		let interval;
		if (timeRemaining > 0) {
			interval = setInterval(() => {
				setTimeRemaining((prev) => {
					if (prev <= 1) {
						setExpired(true);
						clearInterval(interval);
						router.push("/status/failure"); // Redirigir si expira
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}

		return () => clearInterval(interval);
	}, [timeRemaining]);

	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	const copyDirection = async (texto) => {
		await navigator.clipboard.writeText(texto);
		setCopiedDirection(true);
		setTimeout(() => setCopiedDirection(false), 2000);
	};
	const copyValue = async (texto) => {
		await navigator.clipboard.writeText(texto);
		setCopiedValue(true);
		setTimeout(() => setCopiedValue(false), 2000);
	};
	const copyTag = async (texto) => {
		await navigator.clipboard.writeText(texto);
		setCopiedTag(true);
		setTimeout(() => setCopiedTag(false), 2000);
	};

	if (isLoading) {
		return <div>Cargando...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!paymentData) {
		return <div>No se encontró información del pago</div>;
	}

	// Filtra la moneda correspondiente a la orden
	const selectedCurrency = currencies.find(
		(curr) => curr.blockchain === currencyId
	);

	return (
		<div className="flex gap-6 w-4/5 font-mulish">
			<div className="w-1/2 flex flex-col gap-6">
				<h1 className="font-bold text-xl text-primary">Resumen del pedido</h1>
				<div className="bg-[#F9FAFC] rounded-2xl flex flex-col h-fit text-primary border border-[#F5F5F5] p-8">
					<div className="flex flex-col gap-8">
						<div className="flex h-11 border-b border-[#C0CCDA] justify-between">
							<span className="text-primary font-bold pl-2 text-lg">
								Importe:
							</span>
							<span className="font-bold pr-4 text-lg">
								{paymentData.fiat_amount} {paymentData.fiat}
							</span>
						</div>

						<div className="flex justify-between border-b border-[#C0CCDA] h-11">
							<span className="text-primary font-bold pl-1 text-base">
								Moneda seleccionada:
							</span>
							<div className="flex gap-2">
								{selectedCurrency && (
									<div className="flex flex-row items-center gap-2.5 h-fit">
										<img
											src={selectedCurrency.image}
											alt={`${selectedCurrency.blockchain} logo`}
											width={24}
											height={24}
										/>
										<span className="font-bold pr-4 text-base">
											{paymentData.currency_id.split("_")[0]}
										</span>
									</div>
								)}
							</div>
						</div>

						<div className="flex flex-col gap-8 h-20">
							<div className="flex justify-between">
								<span className="text-primary font-bold pl-1 text-base">
									Comercio:
								</span>
								<span className="font-semibold pr-1 text-base">
									{paymentData.merchant_device}
								</span>
							</div>

							<div className="flex justify-between">
								<span className="text-primary font-bold pl-1 text-base">
									Fecha:
								</span>
								<span className="font-semibold pr-1 text-base">
									{new Date(paymentData.created_at)
										.toLocaleString()
										.split(",")
										.join("")}
								</span>
							</div>
						</div>

						<div className="flex justify-between border-t border-[#C0CCDA] h-11 items-end">
							<span className="text-primary font-bold text-base pl-2.5">
								Concepto:
							</span>
							<span className="font-semibold text-base pr-4">
								{paymentData.reference}
							</span>
						</div>
					</div>
				</div>
			</div>
			<div className="w-1/2 flex flex-col gap-6">
				<h1 className="font-bold text-xl text-primary">Realiza el pago</h1>
				<div className="bg-white rounded-2xl flex flex-col gap-8 p-8 text-primary border-[1px] border-[#F5F5F5]">
					<div className="flex justify-center items-center gap-1">
						<LuClock />
						<span className="text-primary font-medium">
							{formatTime(timeRemaining)}
						</span>
					</div>

					<div className="flex flex-col items-center gap-8">
						<div className="flex justify-center w-full">
							<button className="px-3 py-2 rounded-full bg-[#035AC5] text-white font-normal w-max">
								Smart QR
							</button>
						</div>
						<div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border border-[#F5F5F5] p-4">
							<img
								src="https://t3.ftcdn.net/jpg/01/31/94/36/360_F_131943646_gv3LIkiKlNcmmcWnrCq0s1KInXueFH7m.jpg"
								alt="QR Code"
								className="w-full h-full object-contain"
							/>
						</div>

						<div className="w-[85%] flex flex-col items-center gap-3">
							<div className="w-full gap-2 flex justify-center">
								<span className="text-sm font-semibold text-primary">
									Enviar{" "}
									<span className="text-lg">
										{paymentData.crypto_amount}{" "}
										{paymentData.currency_id.split("_")[0]}
									</span>
								</span>
								<button
									onClick={() => copyValue(paymentData.crypto_amount)}
									className="text-[#035AC5] flex-shrink-0"
								>
									{copiedValue ? <LuCheck size={20} /> : <LuCopy size={20} />}
								</button>
							</div>

							<div className="flex items-start gap-2 max-w-full w-fit">
								<span className="text-sm font-normal break-all flex-1 text-center">
									{paymentData.address}
								</span>
								<button
									onClick={() => copyDirection(paymentData.address)}
									className="text-[#035AC5] flex-shrink-0"
								>
									{copiedDirection ? (
										<LuCheck size={20} />
									) : (
										<LuCopy size={20} />
									)}
								</button>
							</div>

							{paymentData.tag_memo ? (
								<div className="flex items-center gap-2">
									<div className="flex items-center justify-center">
										<TbInfoHexagonFilled
											color="#EAB308"
											size={24}
											className="z-10 cursor-pointer"
										/>
										<div className="bg-primary h-3 w-3 absolute z-0"></div>
									</div>
									<p className="text-sm text-primary">
										Etiqueta de destino: {paymentData.tag_memo}
									</p>
									<button
										onClick={() => copyTag(paymentData.tag_memo)}
										className="text-[#035AC5]"
									>
										{copiedTag ? <LuCheck size={20} /> : <LuCopy size={20} />}
									</button>
								</div>
							) : (
								<p className="text-sm text-primary">
									No se encontro etiqueta de destino
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
