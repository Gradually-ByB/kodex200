export interface Stock {
  번호: number;
  종목명: string;
  ISIN: string;
  종목코드: string;
  수량: string | number;
  "비중(%)": string;
  "평가금액(원)": string;
  "현재가(원)": string;
  "등락(원)": string | number;
}

export interface Quote {
  code: string;
  price: number;
  changeRate: number; // e.g., 0.52 for 0.52%
  changeAmount: number;
  volume: number;
}

export interface EtfQuote {
  price: number;
  changeRate: number;
  changeAmount: number;
}

export interface IndexData {
  value: number;
  change: number;
  rate: number;
}

export interface ApiResponse {
  etf: EtfQuote;
  tiger: EtfQuote;
  stocks: (Stock & Quote)[];
  marketIndices: {
    kospi: IndexData;
    kosdaq: IndexData;
    kosdaq150?: IndexData;
    usdKrw?: IndexData;
  };
}
export interface Portfolio {
  id: string;
  kodexQuantity: number;
  kodexAvgPrice: number;
  kodexPrincipal: number;
  tigerQuantity: number;
  tigerAvgPrice: number;
  tigerPrincipal: number;
  updatedAt: string;
}
