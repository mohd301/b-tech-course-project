import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "../ui/dialog"
import { Button } from "../ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion.js"
import { BookOpen, CheckCircle2, User, X } from "lucide-react"

export default function HelpDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <DialogTitle>Help Center</DialogTitle>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="what-is">
                <AccordionTrigger>What is the Government Subsidy System?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    The Government Subsidy System is an online platform that allows Omani citizens to apply for and manage government subsidies. The system uses machine learning to determine eligibility for various subsidy programs automatically.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-to-register">
                <AccordionTrigger>How do I register for an account?</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Click on the "Register" button on the login page</li>
                    <li>Fill in your email address and phone number</li>
                    <li>Create a secure password</li>
                    <li>Verify your email using the OTP sent to your email</li>
                    <li>Complete your profile information</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="first-eligibility">
                <AccordionTrigger>How do I check my eligibility for a subsidy?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    After logging in, navigate to the "Eligibility Check" tab in your dashboard. Follow the step-by-step wizard to provide your information. The system will automatically calculate your eligibility score based on various factors such as vehicle ownership, family size, and other criteria.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="types-subsidies">
                <AccordionTrigger>What types of subsidies are available?</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Fuel Subsidy</li>
                    <li>Gas Cylinder Subsidy</li>
                    <li>Electric Vehicle Incentive</li>
                    <li>Public Transport Subsidy</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="eligibility" className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="how-calculated">
                <AccordionTrigger>How is eligibility calculated?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-2">
                    Our system uses a machine learning algorithm to evaluate your eligibility based on multiple factors:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Valid National ID verification</li>
                    <li>Vehicle ownership status</li>
                    <li>Vehicle efficiency (cylinder count)</li>
                    <li>Family size and composition</li>
                    <li>Previous subsidy history</li>
                  </ul>
                  <p className="text-muted-foreground mt-2">
                    Each factor contributes to your overall eligibility score. A score of 60% or above typically qualifies you for subsidies.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="required-documents">
                <AccordionTrigger>What documents do I need for eligibility check?</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Valid National ID (NID)</li>
                    <li>Information about your vehicle (if applicable)</li>
                    <li>Family size and composition details</li>
                    <li>Contact information for verification</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="not-eligible">
                <AccordionTrigger>What if I'm not eligible?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    If you're not currently eligible for a subsidy, the system will provide feedback on which criteria you didn't meet. You may become eligible in the future if your circumstances change. We recommend checking your eligibility periodically or updating your information when your situation changes.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="appeal-process">
                <AccordionTrigger>Can I appeal an eligibility decision?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Yes, if you believe there's an error in your eligibility assessment, you can contact our support team through the "Contact Support" option. Please provide details about your situation and any relevant documentation for review.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="change-password">
                <AccordionTrigger>How do I change my password?</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Go to the "Profile" tab in your dashboard</li>
                    <li>Click on the "Change Password" sub-tab</li>
                    <li>Enter your current password</li>
                    <li>Enter your new password (minimum 6 characters)</li>
                    <li>Confirm your new password</li>
                    <li>Click "Change Password"</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="forgot-password">
                <AccordionTrigger>I forgot my password. What do I do?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    You can reset your password using the "Forgot Password" link on the login page. Enter your email address, and we'll send you a verification code. After verification, you can create a new password.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="update-info">
                <AccordionTrigger>How do I update my personal information?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Some personal information like your email and phone number can only be updated by system administrators for security reasons. If you need to update your contact information, please contact support through the Help Center or email us at support@subsidy.gov.om.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="delete-account">
                <AccordionTrigger>How do I delete my account?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    To delete your account, please contact our support team. Account deletion is permanent and will remove all your data from our system, including application history and eligibility records. We recommend downloading any important information before requesting deletion.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="security">
                <AccordionTrigger>How secure is my data?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-muted-foreground">
                    <p>We take data security seriously. Here's how we protect your information:</p>
                    <ul className="list-disc list-inside">
                      <li>All passwords are encrypted using bcrypt</li>
                      <li>Sessions use secure JWT tokens</li>
                      <li>SSL/TLS encryption for all data transmission</li>
                      <li>Regular security audits and updates</li>
                      <li>Compliance with Omani data protection regulations</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <p>Still need help? Contact our support team at support@subsidy.gov.om</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
