'use client'
import { useState } from 'react';
import { LuInfo } from "react-icons/lu";


export default function Home() {
  const [amount, setAmount] = useState('');
  const [crypto, setCrypto] = useState('');
  const [concept, setConcept] = useState('');

  return (
    <div className="bg-white rounded-2xl w-2/5 justify-center flex flex-col gap-8 p-8 text-primary border-[1px] border-[#F5F5F5]" 
      style={{
        boxShadow: "0px 0px 4.39px 0px #00000005, 0px 0px 27px 0px #0000000A"
      }}>
      <h1 className="font-mulish font-bold text-3xl self-center">Crear Pago</h1>
      <div className="flex flex-col gap-8">
        <label className="flex flex-col font-mulish font-bold text-sm gap-1">
          Importe a pagar
          <input 
            type="number" 
            className="w-full rounded-md h-14 px-3 py-[18px] border-[#E5E9F2] border-[1px] text-sm font-normal" 
            placeholder="Añade importe a pagar"
            onChange={(e) => setAmount(e.target.value)}
            value={amount}
          />
        </label>
        <label className="flex flex-col font-mulish font-bold text-sm gap-1">
          <span className='flex items-center gap-1'>Seleccionar moneda <LuInfo color='#647184' size={14} className='cursor-pointer' onClick={""}/></span>
          <select 
            className="w-full rounded-md h-14 px-3 py-[18px] border-[#E5E9F2] border-[1px] text-sm font-normal"
            onChange={(e) => setCrypto(e.target.value)}
            value={crypto}
          >
            <option value="">Selecciona una criptomoneda</option>
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="USDT">Tether (USDT)</option>
            <option value="BNB">Binance Coin (BNB)</option>
            <option value="SOL">Solana (SOL)</option>
          </select>
        </label>
        <label className="flex flex-col font-mulish font-bold text-sm gap-1">
          Concepto
          <input 
            type="text" 
            className="w-full rounded-md h-14 px-3 py-[18px] border-[#E5E9F2] border-[1px] text-sm font-normal" 
            placeholder="Añade concepto del pago"
            onChange={(e) => setConcept(e.target.value)}
            value={concept}
          />
        </label>
        <button
          disabled={!amount || !crypto || !concept}
          className={`h-14 rounded-md font-mulish font-bold text-white
            ${(!amount || !crypto || !concept) 
              ? 'bg-[#C6DFFE] cursor-not-allowed'
              : 'bg-[#035AC5] hover:bg-[#035AC5]/90'
            }`}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
