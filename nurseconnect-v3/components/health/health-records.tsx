"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileText, Pill, Stethoscope, Upload, Lock, Calendar, ChevronRight, X, Eye, Download, Plus } from "lucide-react"
import { useApp } from "@/lib/app-context"

interface Record {
  name: string
  date: string
  status: string
  details?: string
}

interface RecordCategory {
  type: string
  icon: typeof FileText
  items: Record[]
  color: string
}

const initialRecords: RecordCategory[] = [
  {
    type: "Lab Reports",
    icon: FileText,
    items: [
      { name: "Blood Test Report", date: "Mar 15, 2024", status: "Normal", details: "CBC, Lipid Profile - All values within normal range" },
      { name: "Thyroid Panel", date: "Feb 28, 2024", status: "Review", details: "TSH slightly elevated - Follow-up recommended" },
    ],
    color: "bg-blue-500",
  },
  {
    type: "Medication History",
    icon: Pill,
    items: [
      { name: "Metformin 500mg", date: "Ongoing", status: "Active", details: "Take twice daily with meals" },
      { name: "Vitamin D3", date: "Ongoing", status: "Active", details: "60,000 IU weekly" },
    ],
    color: "bg-emerald-500",
  },
  {
    type: "Past Consultations",
    icon: Stethoscope,
    items: [
      { name: "Dr. Sharma - General", date: "Mar 10, 2024", status: "Completed", details: "Annual checkup - No significant findings" },
      { name: "Dr. Patel - Cardiology", date: "Jan 22, 2024", status: "Completed", details: "ECG normal, continue current medications" },
    ],
    color: "bg-primary",
  },
]

export function HealthRecords() {
  const { addNotification } = useApp()
  const [records, setRecords] = useState(initialRecords)
  const [selectedCategory, setSelectedCategory] = useState<RecordCategory | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  const handleViewCategory = (category: RecordCategory) => {
    setSelectedCategory(category)
  }

  const handleViewRecord = (record: Record) => {
    setSelectedRecord(record)
  }

  const handleCloseModal = () => {
    setSelectedCategory(null)
    setSelectedRecord(null)
  }

  const handleUpload = () => {
    if (uploadFile) {
      // Add to lab reports
      const newRecord: Record = {
        name: uploadFile.name.replace(/\.[^/.]+$/, ""),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: "Pending Review",
        details: "Uploaded document awaiting verification"
      }
      
      setRecords(prev => prev.map(cat => 
        cat.type === "Lab Reports" 
          ? { ...cat, items: [newRecord, ...cat.items] }
          : cat
      ))
      
      addNotification({
        type: "success",
        title: "Report Uploaded",
        message: `${uploadFile.name} has been securely uploaded.`,
      })
      
      setUploadFile(null)
      setShowUploadModal(false)
    }
  }

  const handleDownload = (record: Record) => {
    addNotification({
      type: "info",
      title: "Downloading Report",
      message: `Preparing ${record.name} for download...`,
    })
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-primary" />
              Health Record Vault (EHR)
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              <Lock className="h-3 w-3 mr-1" />
              End-to-End Encrypted
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Record Categories */}
          <div className="grid gap-4 sm:grid-cols-3">
            {records.map((record) => (
              <div
                key={record.type}
                onClick={() => handleViewCategory(record)}
                className="rounded-xl border bg-card p-4 hover:shadow-md transition-all cursor-pointer group hover:border-primary/30"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-lg ${record.color} flex items-center justify-center`}>
                    <record.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{record.type}</h3>
                    <p className="text-xs text-muted-foreground">{record.items.length} records</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="space-y-2">
                  {record.items.slice(0, 2).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-xs bg-muted/50 rounded-lg px-3 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.date}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] shrink-0 ${
                          item.status === "Normal" || item.status === "Active" || item.status === "Completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.status === "Pending Review"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <Button 
            variant="outline" 
            className="w-full" 
            size="lg"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload New Report
            <Lock className="h-3 w-3 ml-2 text-muted-foreground" />
          </Button>
        </CardContent>
      </Card>

      {/* Category Detail Modal */}
      {selectedCategory && !selectedRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${selectedCategory.color} flex items-center justify-center`}>
                  <selectedCategory.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{selectedCategory.type}</h2>
                  <p className="text-sm text-muted-foreground">{selectedCategory.items.length} records</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedCategory.items.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleViewRecord(item)}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{item.name}</h3>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        item.status === "Normal" || item.status === "Active" || item.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {item.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-lg">{selectedRecord.name}</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedRecord(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="font-medium">{selectedRecord.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant="secondary"
                  className={`${
                    selectedRecord.status === "Normal" || selectedRecord.status === "Active" || selectedRecord.status === "Completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {selectedRecord.status}
                </Badge>
              </div>
              {selectedRecord.details && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Notes</span>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedRecord.details}</p>
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => handleDownload(selectedRecord)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-lg">Upload Medical Report</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowUploadModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                <Input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  {uploadFile ? (
                    <p className="font-medium text-primary">{uploadFile.name}</p>
                  ) : (
                    <>
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
                    </>
                  )}
                </label>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Your files are encrypted and stored securely</span>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" disabled={!uploadFile} onClick={handleUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
