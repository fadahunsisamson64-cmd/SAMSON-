import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    
    // Use matches instead of innerWidth for more reliable sync
    const initialValue = mql.matches
    if (isMobile !== initialValue) {
      setTimeout(() => {
        setIsMobile(initialValue)
      }, 0)
    }
    
    return () => mql.removeEventListener("change", onChange)
  }, [isMobile])

  return !!isMobile
}
