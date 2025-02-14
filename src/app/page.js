"use client";
import { useState, useRef, useEffect } from "react";
import { LuInfo, LuChevronDown } from "react-icons/lu";
import { createPayment, fetchCurrencies } from "@/utils/dbCalls";
import { useRouter } from "next/navigation";

export default function Home() {
	const [amount, setAmount] = useState("");
	const [crypto, setCrypto] = useState(null);
	const [cryptocurrencies, setCryptocurrencies] = useState([]);
	const [concept, setConcept] = useState("");
	const [showCurrency, setShowCurrency] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const popupRef = useRef(null);
	const buttonRef = useRef(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [errors, setErrors] = useState({
		amount: "",
		concept: "",
	});
	const router = useRouter();

	useEffect(() => {
		const getCurrencies = async () => {
			try {
				setIsLoading(true);
				const data = await fetchCurrencies();
				setCryptocurrencies(data);
				// Establecer la primera criptomoneda como predeterminada
				if (data.length > 0) {
					setCrypto(data[0]);
				}
			} catch (error) {
				console.error("Error fetching currencies:", error);
			} finally {
				setIsLoading(false);
			}
		};

		getCurrencies();
	}, []);

	const filteredCryptocurrencies = cryptocurrencies.filter(
		(coin) =>
			coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
	);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				popupRef.current &&
				!popupRef.current.contains(event.target) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target)
			) {
				setShowCurrency(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Función de validación
	const validateFields = (field, value) => {
		let newErrors = { ...errors };

		switch (field) {
			case "amount":
				if (!value) {
					newErrors.amount = "El importe es requerido";
				} else if (isNaN(value) || value <= 0) {
					newErrors.amount = "El importe debe ser un número válido mayor a 0";
				} else if (crypto) {
					if (Number(value) < crypto.min_amount) {
						newErrors.amount = `El importe mínimo para ${crypto.name
							.split(" ")
							.slice(0, -2)
							.join(" ")} es ${crypto.min_amount}`;
					} else if (Number(value) > crypto.max_amount) {
						newErrors.amount = `El importe máximo para ${crypto.name
							.split(" ")
							.slice(0, -2)
							.join(" ")} es ${crypto.max_amount}`;
					} else {
						newErrors.amount = "";
					}
				} else {
					newErrors.amount = "";
				}
				break;
			case "concept":
				if (!value) {
					newErrors.concept = "El concepto es requerido";
				} else {
					newErrors.concept = "";
				}
				break;
		}

		setErrors(newErrors);
	};

	// Agregar efecto para validar el monto cuando cambia la criptomoneda
	useEffect(() => {
		if (amount) {
			validateFields("amount", amount);
		}
	}, [crypto]);

	const handleClick = async () => {
		try {
			setIsLoading(true);

			if (!crypto) {
				throw new Error("Debes seleccionar una criptomoneda");
			}

			const paymentData = {
				amount: Number(amount),
				crypto: crypto,
				concept: concept,
			};

			const response = await createPayment(paymentData);

			router.push(`/resumen/${response.identifier}`);

			// Resetear el formulario
			setAmount("");
			setConcept("");
		} catch (error) {
			console.error("Error al crear el pago:", error);
			setErrors((prev) => ({
				...prev,
				submit:
					error.message ||
					"Error al procesar el pago. Por favor, intenta nuevamente.",
			}));
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<div
			className="bg-white rounded-2xl w-2/5 justify-center flex flex-col gap-8 p-8 text-primary border-[1px] border-[#F5F5F5] relative"
			style={{
				boxShadow: "0px 0px 4.39px 0px #00000005, 0px 0px 27px 0px #0000000A",
			}}
		>
			<h1 className="font-mulish font-bold text-3xl self-center">Crear Pago</h1>

			{showCurrency && (
				<div className="absolute inset-0 flex items-center justify-center z-40">
					<div
						ref={popupRef}
						className="bg-white rounded-2xl w-full h-full p-6"
					>
						<div className="flex justify-between items-center mb-4">
							<h3 className="font-mulish font-bold text-xl text-primary">
								Seleccionar criptomoneda
							</h3>
							<button
								onClick={() => {
									setShowCurrency(false);
									setSearchTerm("");
								}}
								className="text-gray-500 hover:text-gray-700"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<div className="relative mb-4">
							<input
								type="text"
								placeholder="Buscar"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full h-11 pl-10 pr-4 rounded-lg border border-[#E5E9F2] text-sm"
							/>
							<svg
								className="absolute left-3 top-3 w-5 h-5 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
						<div className="space-y-2 max-h-[300px] overflow-y-auto">
							{filteredCryptocurrencies.length > 0 ? (
								filteredCryptocurrencies.map((coin) => (
									<div
										key={coin.symbol}
										onClick={() => {
											setCrypto(coin);
											setShowCurrency(false);
											setSearchTerm("");
										}}
										className="flex items-center justify-between p-3 hover:bg-[#F8FAFC] rounded-lg cursor-pointer"
									>
										<div className="flex items-center gap-3">
											<img
												src={coin.image}
												alt={coin.name.split(" ").slice(0, -2).join(" ")}
												className="w-8 h-8"
											/>
											<div>
												<p className="font-mulish font-bold text-primary">
													{coin.name.split(" ").slice(0, -2).join(" ")}
												</p>
												<p className="text-sm text-gray-500">
													{coin.symbol.split("_")[0]}
												</p>
											</div>
										</div>
										{crypto.symbol === coin.symbol && (
											<div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
												<svg
													className="w-3 h-3 text-white"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M5 13l4 4L19 7"
													/>
												</svg>
											</div>
										)}
									</div>
								))
							) : (
								<div className="text-center py-4 text-gray-500">
									No se encontraron resultados
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			<div className="flex flex-col gap-8">
				<div className="flex flex-col gap-1">
					<label className="font-mulish font-bold text-sm">
						Importe a pagar
					</label>
					<input
						type="number"
						className={`w-full rounded-md h-14 px-3 py-[18px] border-[1px] text-sm font-normal ${
							errors.amount ? "border-red-500" : "border-[#E5E9F2]"
						}`}
						placeholder="Añade importe a pagar"
						onChange={(e) => {
							setAmount(e.target.value);
							validateFields("amount", e.target.value);
						}}
						value={amount}
					/>
					{errors.amount && (
						<span className="text-red-500 text-xs mt-1">{errors.amount}</span>
					)}
				</div>
				<div className="flex flex-col gap-1">
					<label className="font-mulish font-bold text-sm">
						<span className="flex items-center gap-1">
							Seleccionar moneda{" "}
							<LuInfo color="#647184" size={14} className="cursor-pointer" />
						</span>
					</label>
					<div className="relative">
						{isLoading ? (
							<div className="w-full rounded-md h-14 px-3 py-[18px] border-[#E5E9F2] border-[1px] text-sm font-normal flex items-center justify-center">
								Cargando monedas...
							</div>
						) : (
							<div
								className="w-full rounded-md h-14 px-3 py-[18px] border-[#E5E9F2] border-[1px] text-sm font-normal flex flex-row items-center justify-between cursor-pointer"
								onClick={() => setShowCurrency(!showCurrency)}
							>
								<div className="flex flex-row gap-2 items-center">
									{crypto ? (
										<>
											<img
												src={crypto.image}
												alt={crypto.symbol}
												className="h-8 w-8"
											/>
											<p>
												{crypto.name.split(" ").slice(0, -2).join(" ")} (
												{crypto.symbol.split("_")[0]})
											</p>
										</>
									) : (
										<p>Seleccione una moneda</p>
									)}
								</div>
								<LuChevronDown color="#647184" size={20} />
							</div>
						)}
					</div>
				</div>
				<div className="flex flex-col gap-1">
					<label className="font-mulish font-bold text-sm">Concepto</label>
					<input
						type="text"
						className={`w-full rounded-md h-14 px-3 py-[18px] border-[1px] text-sm font-normal ${
							errors.concept ? "border-red-500" : "border-[#E5E9F2]"
						}`}
						placeholder="Añade concepto del pago"
						onChange={(e) => {
							setConcept(e.target.value);
							validateFields("concept", e.target.value);
						}}
						value={concept}
					/>
					{errors.concept && (
						<span className="text-red-500 text-xs mt-1">{errors.concept}</span>
					)}
				</div>
				<button
					disabled={!amount || !concept || errors.amount || errors.concept}
					className={`h-14 rounded-md font-mulish font-bold text-white
            ${
							!amount || !concept || errors.amount || errors.concept
								? "bg-[#C6DFFE] cursor-not-allowed"
								: "bg-[#035AC5] hover:bg-[#035AC5]/90"
						}`}
					onClick={handleClick}
				>
					Continuar
				</button>
			</div>
		</div>
	);
}
