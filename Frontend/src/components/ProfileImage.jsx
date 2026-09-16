import { useEffect, useMemo } from 'react'

const ProfileImage = ({ image, alt = 'Profile', className = '', style }) => {
    const src = useMemo(() => {
        if (!image) return ''
        return typeof image === 'string' ? image : URL.createObjectURL(image)
    }, [image])

    useEffect(() => {
        return typeof image === 'string' || !src ? undefined : () => URL.revokeObjectURL(src)
    }, [image, src])

    return src ? <img src={src} alt={alt} className={className} style={style} /> : null
}

export default ProfileImage
