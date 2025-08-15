import { useEffect, useRef } from 'react'

const useIntersectionObserver = (callback: () => void) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    console.log("Hi")
                    callback()
                }
            })
        })

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => observer.disconnect()
    }, [callback])

    return ref
}

export default useIntersectionObserver;