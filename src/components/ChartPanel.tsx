import { TimeFrame } from '@/lib/types/timeframe'
import {
    CandlestickSeries,
    ColorType,
    createChart,
    type CandlestickData,
    type ISeriesApi,
    type Time,
} from 'lightweight-charts'
import { useEffect, useRef, useState, type FC } from 'react'
import { Button } from './ui/button'

const ChartPanel: FC<{
    instrument: string
    price?: number | null
    prevPrice?: number | null
    change_24h?: number | null
    high_24h?: number | null
    low_24h?: number | null
    volume_24h?: number | null
    candles: CandlestickData<Time>[]
    seriesRef: React.RefObject<ISeriesApi<'Candlestick'> | null>
    onTimeFrameChange: (value: TimeFrame) => void
}> = ({
    instrument,
    price,
    prevPrice,
    change_24h,
    high_24h,
    low_24h,
    volume_24h,
    candles,
    seriesRef,
    onTimeFrameChange = () => {},
}) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [timeFrame, _setCurrentTimeFrame] = useState<TimeFrame>(TimeFrame.M5)

    useEffect(() => {
        if (!containerRef.current || !candles.length) return

        const chart = createChart(containerRef.current, {
            layout: {
                background: {
                    type: ColorType.Solid,
                    color: 'transparent',
                },
                textColor: 'white',
            },
            grid: {
                vertLines: { color: '#151515' },
                horzLines: { color: '#151515' },
            },
            timeScale: {
                timeVisible: true,
            },
        })
        
        if (!seriesRef.current) {
            seriesRef.current = chart.addSeries(CandlestickSeries)
        }
        seriesRef.current.setData(candles)
    }, [containerRef, candles])

    const setTimeFrame = (val: TimeFrame): void => {
        onTimeFrameChange(val)
        _setCurrentTimeFrame(val)
    }

    return (
        <div className="w-full h-full flex flex-col p-5 gap-1">
            <div className="w-full h-15 flex flex-row items-center justify-start">
                <div className="w-fit  h-full flex flex-col px-2 text-left border-r border-neutral-800">
                    <div className="flex flex-col">
                        <span className="font-bold text-sm whitespace-nowrap">
                            {instrument}
                        </span>
                        <span
                            className={`
                            font-semibold
                            ${
                                typeof price == 'number' &&
                                typeof prevPrice === 'number'
                                    ? price >= prevPrice
                                        ? 'text-[var(--green)]'
                                        : 'text-[var(--red)]'
                                    : ''
                            }
                        `}
                        >
                            {typeof price === 'number' ? price : '-'}
                        </span>
                    </div>
                </div>

                <div className="w-30 h-full flex items-center justify-center px-2 ">
                    <div className="flex flex-col">
                        <span className="font-bold text-right text-sm text-neutral-500">
                            24h Change
                        </span>
                        <span
                            className={`
                            text-right
                            font-semibold
                            text-sm
                            ${
                                typeof change_24h === 'number'
                                    ? change_24h >= 0
                                        ? 'text-[var(--green)]'
                                        : 'text-[var(--red)]'
                                    : ''
                            }
                        `}
                        >
                            {typeof change_24h === 'number'
                                ? `${change_24h.toFixed(2)}%`
                                : '-'}
                        </span>
                    </div>
                </div>

                <div className="w-30 h-full flex items-center justify-center px-2 ">
                    <div className="flex flex-col">
                        <span className="font-bold text-right text-sm text-neutral-500">
                            24h High
                        </span>
                        <span className="text-right font-semibold text-sm">
                            {typeof high_24h === 'number'
                                ? high_24h.toFixed(2)
                                : '-'}
                        </span>
                    </div>
                </div>

                <div className="w-30 h-full flex items-center justify-center px-2  ">
                    <div className="flex flex-col">
                        <span className="font-bold text-right text-sm text-neutral-500">
                            24h Low
                        </span>
                        <span className="text-right font-semibold text-sm">
                            {typeof low_24h === 'number'
                                ? low_24h.toFixed(2)
                                : '-'}
                        </span>
                    </div>
                </div>

                <div className="w-30 h-full flex items-center justify-center px-2 ">
                    <div className="flex flex-col">
                        <span className="font-bold text-right text-sm text-neutral-500">
                            24h Volume
                        </span>
                        <span className="text-right font-semibold text-sm">
                            {typeof volume_24h === 'number'
                                ? volume_24h.toFixed(2)
                                : '-'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="w-full h-10 flex flex-row items-center justify-start gap-3">
                {Object.values(TimeFrame).map((val) => (
                    <Button
                        type="button"
                        className={`bg-transparent hover:bg-transparent rounded-none border-b-1 border-b-transparent cursor-pointer transition-border-b duration-300 ${timeFrame === val ? 'border-b-blue-500 text-white' : 'hover:border-b-blue-600 text-neutral-900'}`}
                        onClick={() => setTimeFrame(val as TimeFrame)}
                    >
                        {val}
                    </Button>
                ))}
            </div>
            <div ref={containerRef} className="w-full flex-1 text-center"></div>
        </div>
    )
}
export default ChartPanel
