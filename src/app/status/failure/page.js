"use client";
import React from "react";
import { BsFillXCircleFill } from "react-icons/bs";
import { useRouter } from "next/navigation";

export default function Failure() {
	const router = useRouter();

	const handleRedirect = () => {
		router.push("/");
	};

	return (
		<div
			className="bg-white rounded-2xl w-1/3 justify-center flex flex-col p-8 text-primary border-[1px] border-[#F5F5F5] relative"
			style={{
				boxShadow: "0px 0px 4.39px 0px #00000005, 0px 0px 27px 0px #0000000A",
			}}
		>
			<div className="p-8 flex flex-col justify-evenly items-center gap-4">
				<div className="flex items-center justify-center">
					<BsFillXCircleFill color="#DC2626" size={80} className="z-10" />
				</div>
				<h1 className="font-bold font-mulish text-primary text-xl">
					¡Pago Cancelado!
				</h1>
				<p className="text-base font-normal font-mulish text-[#647184] text-center">
					Lorem ipsum dolor sit amet consectetur. Laoreet blandit auctor et
					varius dolor elit facilisi enim. Nulla ut ut eu nunc.
				</p>
			</div>
			<button
				className="font-mulish text-white text-base font-semibold bg-[#035AC5] h-14 px-6 py-4 rounded-md"
				onClick={handleRedirect}
			>
				Volver al Inicio
			</button>
		</div>
	);
}
