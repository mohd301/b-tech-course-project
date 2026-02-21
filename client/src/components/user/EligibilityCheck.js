import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { Stepper } from "../ui/stepper.jsx"
import { Progress } from "../ui/progress"
import { Badge } from "../ui/badge"
import { Tooltip } from "../ui/tooltip"
import { toast } from "sonner"
import { addMoreInfoThunk, getMoreInfoThunk, setEligibilityResult } from "../../slices/SliceUser"

const steps = ["Personal Info", "Vehicle Info", "Subsidy Info", "Review"]

export default function EligibilityCheck() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.user)
  const moreInfo = useSelector((state) => state.user.moreInfo)
  const eligibilityResult = useSelector((state) => state.user.eligibilityResult)
  const loading = useSelector((state) => state.user.loading)

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    NID: "",
    VehicleOwnership: "",
    CylinderCount: "",
    SubsidyType: "",
    FamilySize: ""
  })

  useEffect(() => {
    // Load saved draft from localStorage
    const savedDraft = localStorage.getItem("eligibilityDraft")
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft))
    }
    // Fetch existing more info if any
    dispatch(getMoreInfoThunk())
  }, [dispatch])

  useEffect(() => {
    // Update form data if more info exists
    if (moreInfo) {
      setFormData({
        NID: moreInfo.NID || "",
        VehicleOwnership: moreInfo.Vehicle_Ownership || "",
        CylinderCount: moreInfo.Cylinder_Count?.toString() || "",
        SubsidyType: moreInfo.SubsidyType || "",
        FamilySize: moreInfo.FamilySize?.toString() || ""
      })
    }
  }, [moreInfo])

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    // Auto-save to localStorage
    localStorage.setItem("eligibilityDraft", JSON.stringify({ ...formData, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      // Save the ML data
      await dispatch(addMoreInfoThunk({
        Email: user.Email,
        NID: formData.NID,
        Vehicle_Ownership: formData.VehicleOwnership,
        Cylinder_Count: parseInt(formData.CylinderCount),
        SubsidyType: formData.SubsidyType,
        FamilySize: parseInt(formData.FamilySize)
      }))

      // Simulate ML eligibility check (in production, this would be an API call)
      const eligibilityScore = calculateEligibility(formData)
      dispatch(setEligibilityResult(eligibilityScore))

      toast.success("Eligibility check completed!")
      setCurrentStep(4) // Results step
    } catch (error) {
      toast.error("Failed to complete eligibility check")
    }
  }

  const calculateEligibility = (data) => {
    // Simple mock ML scoring algorithm
    let score = 0
    let factors = []

    // NID validation factor
    if (data.NID && data.NID.length >= 8) {
      score += 25
      factors.push({ name: "Valid NID", score: 25, description: "NID provided and validated" })
    } else {
      factors.push({ name: "Valid NID", score: 0, description: "NID is required for verification" })
    }

    // Vehicle ownership factor
    if (data.VehicleOwnership === "No") {
      score += 35
      factors.push({ name: "Vehicle Ownership", score: 35, description: "Non-vehicle owners eligible" })
    } else {
      score += 10
      factors.push({ name: "Vehicle Ownership", score: 10, description: "Limited eligibility for vehicle owners" })
    }

    // Cylinder count factor
    const cylinders = parseInt(data.CylinderCount) || 0
    if (cylinders <= 4) {
      score += 25
      factors.push({ name: "Vehicle Efficiency", score: 25, description: "Fuel-efficient vehicle" })
    } else {
      score += 10
      factors.push({ name: "Vehicle Efficiency", score: 10, description: "Lower efficiency vehicle" })
    }

    // Family size factor
    const familySize = parseInt(data.FamilySize) || 0
    if (familySize >= 1 && familySize <= 4) {
      score += 15
      factors.push({ name: "Family Size", score: 15, description: "Optimal family size for subsidy" })
    } else if (familySize > 4) {
      score += 10
      factors.push({ name: "Family Size", score: 10, description: "Large family, partial eligibility" })
    } else {
      factors.push({ name: "Family Size", score: 0, description: "Family information required" })
    }

    return {
      score,
      eligible: score >= 60,
      status: score >= 80 ? "high" : score >= 60 ? "medium" : "low",
      factors
    }
  }

  const saveDraft = () => {
    localStorage.setItem("eligibilityDraft", JSON.stringify(formData))
    toast.success("Draft saved successfully")
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="NID">
                National ID (NID)
                <Tooltip content="Your 8-12 digit national identification number">
                  <span className="ml-2 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-100 text-blue-600 text-xs">?</span>
                </Tooltip>
              </Label>
              <Input
                id="NID"
                placeholder="Enter your NID"
                value={formData.NID}
                onChange={(e) => handleInputChange("NID", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="FamilySize">
                Family Size
                <Tooltip content="Number of dependents in your household">
                  <span className="ml-2 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-100 text-blue-600 text-xs">?</span>
                </Tooltip>
              </Label>
              <Select
                value={formData.FamilySize}
                onValueChange={(value) => handleInputChange("FamilySize", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select family size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 member</SelectItem>
                  <SelectItem value="2">2 members</SelectItem>
                  <SelectItem value="3">3 members</SelectItem>
                  <SelectItem value="4">4 members</SelectItem>
                  <SelectItem value="5">5 members</SelectItem>
                  <SelectItem value="6+">6+ members</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="VehicleOwnership">
                Do you own a vehicle?
                <Tooltip content="Vehicle ownership affects subsidy eligibility">
                  <span className="ml-2 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-100 text-blue-600 text-xs">?</span>
                </Tooltip>
              </Label>
              <Select
                value={formData.VehicleOwnership}
                onValueChange={(value) => handleInputChange("VehicleOwnership", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="CylinderCount">
                Vehicle Cylinder Count
                <Tooltip content="Number of cylinders in your vehicle's engine">
                  <span className="ml-2 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-100 text-blue-600 text-xs">?</span>
                </Tooltip>
              </Label>
              <Input
                id="CylinderCount"
                type="number"
                placeholder="Enter cylinder count"
                value={formData.CylinderCount}
                onChange={(e) => handleInputChange("CylinderCount", e.target.value)}
                disabled={formData.VehicleOwnership !== "Yes"}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="SubsidyType">
                Subsidy Type
                <Tooltip content="Select the type of subsidy you're applying for">
                  <span className="ml-2 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-100 text-blue-600 text-xs">?</span>
                </Tooltip>
              </Label>
              <Select
                value={formData.SubsidyType}
                onValueChange={(value) => handleInputChange("SubsidyType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subsidy type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel">Fuel Subsidy</SelectItem>
                  <SelectItem value="gas">Gas Cylinder Subsidy</SelectItem>
                  <SelectItem value="electric">Electric Vehicle Incentive</SelectItem>
                  <SelectItem value="transport">Public Transport Subsidy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Review Your Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">National ID</p>
                <p className="font-medium">{formData.NID || "Not provided"}</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Family Size</p>
                <p className="font-medium">{formData.FamilySize || "Not provided"}</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Vehicle Ownership</p>
                <p className="font-medium">{formData.VehicleOwnership || "Not provided"}</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Cylinder Count</p>
                <p className="font-medium">{formData.CylinderCount || "Not provided"}</p>
              </div>
              <div className="bg-muted p-3 rounded-lg col-span-2">
                <p className="text-sm text-muted-foreground">Subsidy Type</p>
                <p className="font-medium">{formData.SubsidyType || "Not provided"}</p>
              </div>
            </div>
          </div>
        )

      case 4:
        if (!eligibilityResult) return null
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Badge
                variant={eligibilityResult.eligible ? "success" : "destructive"}
                className="text-lg px-6 py-2"
              >
                {eligibilityResult.eligible ? "Eligible" : "Not Eligible"}
              </Badge>
              <p className="text-muted-foreground">
                Your eligibility score: {eligibilityResult.score}%
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Eligibility Breakdown</h4>
              <div className="space-y-4">
                {eligibilityResult.factors.map((factor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{factor.name}</span>
                      <span>{factor.score}%</span>
                    </div>
                    <Progress value={factor.score} />
                    <p className="text-xs text-muted-foreground">{factor.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-lg ${eligibilityResult.eligible ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
              <p className="font-medium">
                {eligibilityResult.eligible
                  ? "Congratulations! You are eligible for this subsidy."
                  : "Based on our assessment, you do not meet the eligibility criteria at this time."}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep(0)
                dispatch(setEligibilityResult(null))
              }}
            >
              Start New Check
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eligibility Check</CardTitle>
        <CardDescription>Determine your eligibility for government subsidies</CardDescription>
      </CardHeader>
      <CardContent>
        {currentStep < 4 ? (
          <>
            <Stepper steps={steps} currentStep={currentStep} />
            <div className="mb-6">
              <Progress value={((currentStep + 1) / steps.length) * 100} />
            </div>

            <div className="min-h-[300px]">
              {renderStepContent()}
            </div>

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={saveDraft}
                >
                  Save Draft
                </Button>
                {currentStep === steps.length - 1 ? (
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Processing..." : "Submit"}
                  </Button>
                ) : (
                  <Button onClick={handleNext} disabled={!formData.NID && currentStep === 0}>
                    Next
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          renderStepContent()
        )}
      </CardContent>
    </Card>
  )
}
