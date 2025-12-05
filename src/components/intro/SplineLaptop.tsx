'use client'

import dynamic from 'next/dynamic'
import { useCallback, useRef, useEffect } from 'react'
import type { Application, SPEObject } from '@splinetool/runtime'

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      Loading 3D...
    </div>
  ),
})

export default function SplineLaptop({ style }: { style: React.CSSProperties }) {
  const splineRef = useRef<Application | null>(null)
  const objectRef = useRef<SPEObject | null>(null)
  const targetRotation = useRef({ x: 0, y: 0 })
  const currentRotation = useRef({ x: 0, y: 0 })
  const baseRotation = useRef({ x: 0, y: 0 })
  const animationFrame = useRef<number | null>(null)

  const onLoad = useCallback((spline: Application) => {
    splineRef.current = spline

    // Log all objects to find the correct name
    const allObjects = spline.getAllObjects()
    console.log('Spline objects:', allObjects.map(obj => obj.name))

    // Try to find the main object - usually named after the model
    const possibleNames = ['Macbook', 'MacBook', 'Laptop', 'laptop', 'Computer', 'Scene', 'Group', 'Model']
    for (const name of possibleNames) {
      const obj = spline.findObjectByName(name)
      if (obj) {
        console.log('Found object:', name, obj)
        objectRef.current = obj
        baseRotation.current = { x: obj.rotation.x, y: obj.rotation.y }
        break
      }
    }

    // If nothing found, try the first object that isn't a camera or light
    if (!objectRef.current && allObjects.length > 0) {
      for (const obj of allObjects) {
        const nameLower = obj.name.toLowerCase()
        if (!nameLower.includes('camera') && !nameLower.includes('light') && !nameLower.includes('directional')) {
          console.log('Using first non-camera/light object:', obj.name)
          objectRef.current = obj
          baseRotation.current = { x: obj.rotation.x, y: obj.rotation.y }
          break
        }
      }
    }
  }, [])

  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor
    }

    const animate = () => {
      currentRotation.current.x = lerp(currentRotation.current.x, targetRotation.current.x, 0.05)
      currentRotation.current.y = lerp(currentRotation.current.y, targetRotation.current.y, 0.05)

      if (objectRef.current) {
        objectRef.current.rotation.x = baseRotation.current.x + currentRotation.current.x
        objectRef.current.rotation.y = baseRotation.current.y + currentRotation.current.y
      }

      animationFrame.current = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1

      targetRotation.current.x = -y * 0.3
      targetRotation.current.y = x * 0.5
    }

    window.addEventListener('mousemove', handleMouseMove)
    animationFrame.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [])

  return (
    <div style={style}>
      <Spline
        scene="https://prod.spline.design/GxBaBOkyXeF3qPPY/scene.splinecode"
        onLoad={onLoad}
      />
    </div>
  )
}
