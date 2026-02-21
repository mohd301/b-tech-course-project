import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card.jsx"
import { Button } from "../ui/button.jsx"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.jsx"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog.jsx"
import { Label } from "../ui/label.jsx"
import { Database, Play, RefreshCw, BarChart3 } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

export default function MLDataTab() {
  const [mlData, setMlData] = useState([])
  const [loading, setLoading] = useState(true)
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [isTraining, setIsTraining] = useState(false)
  const [modelAccuracy, setModelAccuracy] = useState(null)

  useEffect(() => {
    fetchMLData()
  }, [])

  const fetchMLData = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      const response = await axios.get(
        `http://localhost:${process.env.REACT_APP_PORT}/viewmoreinfo`,
        config
      )
      setMlData(response.data.data || response.data || [])
    } catch (error) {
      console.error("Error fetching ML data:", error)
      toast.error("Failed to fetch ML data")
    } finally {
      setLoading(false)
    }
  }

  const handleTrainModel = () => {
    setIsTraining(true)
    setTrainingProgress(0)
    setTrainingDialogOpen(true)

    // Simulate model training progress
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsTraining(false)
          setModelAccuracy(85 + Math.random() * 10)
          toast.success("Model training completed successfully!")
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 500)
  }

  const featureImportance = [
    { feature: "Cylinder Count", importance: 0.35 },
    { feature: "Vehicle Ownership", importance: 0.28 },
    { feature: "Location", importance: 0.18 },
    { feature: "Income Level", importance: 0.12 },
    { feature: "Household Size", importance: 0.07 },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">ML Data</h1>
            <p className="text-muted-foreground">Machine learning data collection</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="h-64 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ML Data</h1>
          <p className="text-muted-foreground">Machine learning data collection</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchMLData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setTrainingDialogOpen(true)}>
            <Play className="mr-2 h-4 w-4" />
            Train Model
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mlData.length}</div>
            <p className="text-xs text-muted-foreground">
              Collected data points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modelAccuracy ? `${modelAccuracy.toFixed(1)}%` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Last training run
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Features</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featureImportance.length}</div>
            <p className="text-xs text-muted-foreground">
              Input variables
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Collected Data</CardTitle>
            <CardDescription>
              View all collected ML training data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>NID</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Cylinders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mlData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No ML data collected yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    mlData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.email || "N/A"}
                        </TableCell>
                        <TableCell>{item.nid || "N/A"}</TableCell>
                        <TableCell>
                          {item.vehicle_ownership ? "Yes" : "No"}
                        </TableCell>
                        <TableCell>{item.cylinder_count || "0"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Importance</CardTitle>
            <CardDescription>
              Key factors in eligibility prediction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featureImportance.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{item.feature}</span>
                    <span className="text-muted-foreground">
                      {(item.importance * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${item.importance * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Training Dialog */}
      <Dialog open={trainingDialogOpen} onOpenChange={setTrainingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Train ML Model</DialogTitle>
            <DialogDescription>
              Train the eligibility prediction model using collected data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!isTraining && modelAccuracy ? (
              <div className="space-y-2">
                <Label>Training Results</Label>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">Model trained successfully!</p>
                  <p className="text-2xl font-bold mt-2">{modelAccuracy.toFixed(1)}% Accuracy</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Training Progress</Label>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${trainingProgress}%` }}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  {trainingProgress < 100
                    ? `Training... ${Math.round(trainingProgress)}%`
                    : "Training complete!"}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            {!isTraining && modelAccuracy && (
              <Button onClick={() => {
                setModelAccuracy(null)
                handleTrainModel()
              }}>
              Retrain Model
              </Button>
            )}
            {!isTraining && !modelAccuracy && (
              <Button onClick={handleTrainModel}>
                Start Training
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setTrainingDialogOpen(false)}
              disabled={isTraining}
            >
              {isTraining ? "Training..." : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
