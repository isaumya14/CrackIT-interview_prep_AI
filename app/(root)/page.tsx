import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { dummyInterviews } from '@/constants'
import InterviewCard from '@/components/InterviewCard'

const page = () => {
  return (
    <>
    <section className='card-cta'>
      <div className='flex flex-col gap-6 max-w-lg'>
        <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
        <p className='text-lg'>
          Practice on real interview questions, get AI-generated feedback, and improve your skills with personalized insights.
        </p>

        <Button asChild className="btn-primary max-sm:w-full">
          <Link href="/interview" > Start an Interview </Link>
        </Button>
      </div>
      <Image src="/robot.png" alt="ROBOT-DUDE" height={400} width={400} className='max-sm:hidden'/>
    </section>

    <section className='flex flex-col gap-6 mt-8'>
      <h2>Your Interviews</h2>
      <div className='interviews-section'>
        
        {dummyInterviews.map((interview)=>(
          <InterviewCard {...interview} key={interview.id}/>
        ))}

        {/* <p>You haven&apos;'t taken any interviews yet.</p> */}

      </div>
    </section>

    <section className='flex flex-col gap-6 mt-8'>
      <h2>Take an Interviews</h2>
      <div className='interviews-section'>
      {dummyInterviews.map((interview)=>(
          <InterviewCard {...interview} key={interview.id}/>
        ))}

        {/* <p>There are no interviews available.</p> */}

      </div>
    </section>
    </>
  )
}

export default page