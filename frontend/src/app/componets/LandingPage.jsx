import React from 'react'
import LNavbar from './LandingComponents/LNavbar'
import HeroSection from './LandingComponents/HeroSection'
import Features from './LandingComponents/Features'
import Contact from './LandingComponents/Contact'
import LFooter from './LandingComponents/LFooter'

export default function LandingPage() {
  return (
    <>
    <LNavbar/>
    <HeroSection/>
    <Features/>
    <Contact/>
    <LFooter/>
    </>
  )
}