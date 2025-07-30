import {
    CandlestickSeries,
    ColorType,
    createChart,
    type CandlestickData,
    type ISeriesApi,
    type Time,
} from 'lightweight-charts'
import { useEffect, useRef, type FC } from 'react'

const ChartPanel: FC<{
    data: CandlestickData<Time>[]
    seriesRef: React.RefObject<ISeriesApi<'Candlestick'> | null>
}> = ({ data, seriesRef }) => {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current || !data.length) return

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
                timeVisible: true
            }
        })
        
        seriesRef.current = chart.addSeries(CandlestickSeries)
        seriesRef.current.setData(data)
    }, [containerRef, data])

    return (
        <div className="w-full h-full p-5">
            <div
                ref={containerRef}
                className="w-full h-full flex-1 text-center"
            ></div>
        </div>
    )
}
export default ChartPanel
