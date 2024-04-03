"use client";
import SubHeader from "@/components/SubHeader";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BarcodeScannerComponent from "@/components/BarcodeScanner";
const ScanPage = () => {
  const router = useRouter();
  const [isScanned, setIsScanned] = useState(false);
  return (
    <>
      <SubHeader title="도서 검색" backArrow={true} />
      <div className="flex items-center min-h-screen justify-center">
        <div className="relative bg-slate-500 w-full flex items-center justify-center h-80">
          <div className={`absolute w-1/2 h-1/3 border-4 z-10 ${isScanned?"border-lime-300":"border-white"}`}></div>
          <div className="absolute bg-black/60 py-2 px-7 z-10 rounded-full self-end text-white mb-2 text-sm">
            {isScanned?"인식 완료! \n상세 페이지로 이동합니다.":"바코드를 인식시켜주세요."}
          </div>
          <BarcodeScannerComponent
            onScanned={(result) => {
              setIsScanned(true);
              router.push(`/detail?isbn=${result}`);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ScanPage;
