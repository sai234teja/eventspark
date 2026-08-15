interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:'8px'}} className={className}>
      <span style={{fontSize:'24px'}}>⚡</span>
      <span style={{fontWeight:700, fontSize:'18px'}}>
        Event<span style={{color:'#6C47FF'}}>Spark</span>
      </span>
    </div>
  )
}
