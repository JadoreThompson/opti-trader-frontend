export interface BaseInstrumentSummary {
    price?: number
    change_24h?: number
}

export interface InstrumentSummary extends BaseInstrumentSummary {
    instrument: string
}

export interface InstrumentSummaryFull extends BaseInstrumentSummary {
    high_24h?: number
    low_24h?: number
    volume_24h?: number
}
