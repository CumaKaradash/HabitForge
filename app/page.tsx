"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Plus, TrendingUp, Heart, Sparkles, Calendar, Target } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"

interface Habit {
  id: string
  name: string
  description: string
  category: string
  streak: number
  completedDates: string[]
  createdAt: string
}

interface MoodEntry {
  id: string
  date: string
  mood: number
  note: string
}

const MOOD_LABELS = {
  1: "Çok Düşük",
  2: "Düşük",
  3: "Orta",
  4: "İyi",
  5: "Harika",
}

const CATEGORIES = ["Sağlık", "Egzersiz", "Beslenme", "Öğrenme", "Yaratıcılık", "İlişkiler", "Mindfulness", "Diğer"]

const ENCOURAGEMENT_MESSAGES = [
  "Harika! Bir adım daha yaklaştın! ✨",
  "Süpersin! Bu momentum'u koru! 🌟",
  "Bravo! Kendine güvenmeye devam et! 💪",
  "Muhteşem! Her gün biraz daha güçleniyorsun! 🚀",
  "Tebrikler! Bu ilerleme gerçekten değerli! 🎉",
]

export default function HabitForge() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [newHabit, setNewHabit] = useState({ name: "", description: "", category: "Sağlık" })
  const [newMood, setNewMood] = useState({ mood: 3, note: "" })
  const [showEncouragement, setShowEncouragement] = useState("")
  const [isAddingHabit, setIsAddingHabit] = useState(false)
  const [isAddingMood, setIsAddingMood] = useState(false)

  // Load data from localStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem("habitforge-habits")
    const savedMoods = localStorage.getItem("habitforge-moods")

    if (savedHabits) {
      setHabits(JSON.parse(savedHabits))
    }
    if (savedMoods) {
      setMoodEntries(JSON.parse(savedMoods))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("habitforge-habits", JSON.stringify(habits))
  }, [habits])

  useEffect(() => {
    localStorage.setItem("habitforge-moods", JSON.stringify(moodEntries))
  }, [moodEntries])

  const addHabit = () => {
    if (!newHabit.name.trim()) return

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      description: newHabit.description,
      category: newHabit.category,
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
    }

    setHabits([...habits, habit])
    setNewHabit({ name: "", description: "", category: "Sağlık" })
    setIsAddingHabit(false)
  }

  const completeHabit = (habitId: string) => {
    const today = new Date().toISOString().split("T")[0]

    setHabits(
      habits.map((habit) => {
        if (habit.id === habitId) {
          if (habit.completedDates.includes(today)) {
            // Already completed today
            return habit
          }

          const newCompletedDates = [...habit.completedDates, today]
          const newStreak = calculateStreak(newCompletedDates)

          // Show encouragement
          const message = ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)]
          setShowEncouragement(message)
          setTimeout(() => setShowEncouragement(""), 3000)

          return {
            ...habit,
            completedDates: newCompletedDates,
            streak: newStreak,
          }
        }
        return habit
      }),
    )
  }

  const calculateStreak = (completedDates: string[]) => {
    if (completedDates.length === 0) return 0

    const sortedDates = completedDates.sort().reverse()
    let streak = 0
    let currentDate = new Date()

    for (const dateStr of sortedDates) {
      const date = new Date(dateStr)
      const diffTime = currentDate.getTime() - date.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays <= streak + 1) {
        streak++
        currentDate = date
      } else {
        break
      }
    }

    return streak
  }

  const addMoodEntry = () => {
    const entry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      mood: newMood.mood,
      note: newMood.note,
    }

    setMoodEntries([...moodEntries, entry])
    setNewMood({ mood: 3, note: "" })
    setIsAddingMood(false)
  }

  const getWeeklyProgress = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    return last7Days.map((date) => {
      const completedCount = habits.filter((habit) => habit.completedDates.includes(date)).length

      return {
        date: new Date(date).toLocaleDateString("tr-TR", { weekday: "short" }),
        completed: completedCount,
        total: habits.length,
      }
    })
  }

  const getMoodChart = () => {
    return moodEntries.slice(-7).map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("tr-TR", { month: "short", day: "numeric" }),
      mood: entry.mood,
    }))
  }

  const today = new Date().toISOString().split("T")[0]
  const todayCompletedCount = habits.filter((habit) => habit.completedDates.includes(today)).length
  const totalHabits = habits.length
  const completionRate = totalHabits > 0 ? Math.round((todayCompletedCount / totalHabits) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-500" />
            HabitForge
          </h1>
          <p className="text-gray-600">İçsel motivasyonunla güçlü alışkanlıklar inşa et</p>
        </div>

        {/* Encouragement Message */}
        {showEncouragement && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <p className="text-green-800 font-medium">{showEncouragement}</p>
            </CardContent>
          </Card>
        )}

        {/* Daily Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Bugünkü İlerleme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Tamamlanan: {todayCompletedCount}/{totalHabits}
                </span>
                <Badge variant={completionRate === 100 ? "default" : "secondary"}>%{completionRate}</Badge>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="habits" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="habits">Alışkanlıklar</TabsTrigger>
            <TabsTrigger value="progress">İlerleme</TabsTrigger>
            <TabsTrigger value="mood">Duygu Takibi</TabsTrigger>
          </TabsList>

          {/* Habits Tab */}
          <TabsContent value="habits" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Alışkanlıklarım</h2>
              <Dialog open={isAddingHabit} onOpenChange={setIsAddingHabit}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-500 hover:bg-purple-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Alışkanlık
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Alışkanlık Ekle</DialogTitle>
                    <DialogDescription>Kendine nazik ol, küçük adımlarla başla</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="habit-name">Alışkanlık Adı</Label>
                      <Input
                        id="habit-name"
                        value={newHabit.name}
                        onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                        placeholder="Örn: 10 dakika meditasyon"
                      />
                    </div>
                    <div>
                      <Label htmlFor="habit-desc">Açıklama (İsteğe bağlı)</Label>
                      <Textarea
                        id="habit-desc"
                        value={newHabit.description}
                        onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                        placeholder="Bu alışkanlık sana nasıl fayda sağlayacak?"
                      />
                    </div>
                    <div>
                      <Label htmlFor="habit-category">Kategori</Label>
                      <Select
                        value={newHabit.category}
                        onValueChange={(value) => setNewHabit({ ...newHabit, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={addHabit} className="w-full">
                      Alışkanlığı Ekle
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {habits.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-200">
                  <CardContent className="p-8 text-center">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz alışkanlık eklemedin</p>
                    <p className="text-sm text-gray-400 mt-2">İlk alışkanlığını ekleyerek başla!</p>
                  </CardContent>
                </Card>
              ) : (
                habits.map((habit) => {
                  const isCompletedToday = habit.completedDates.includes(today)
                  return (
                    <Card
                      key={habit.id}
                      className={`transition-all duration-200 ${isCompletedToday ? "border-green-200 bg-green-50" : "hover:shadow-md"}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium text-gray-800">{habit.name}</h3>
                              <Badge variant="outline">{habit.category}</Badge>
                              {habit.streak > 0 && (
                                <Badge className="bg-orange-100 text-orange-800">🔥 {habit.streak} gün</Badge>
                              )}
                            </div>
                            {habit.description && <p className="text-sm text-gray-600 mt-1">{habit.description}</p>}
                          </div>
                          <Button
                            onClick={() => completeHabit(habit.id)}
                            disabled={isCompletedToday}
                            variant={isCompletedToday ? "default" : "outline"}
                            size="sm"
                            className={isCompletedToday ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {isCompletedToday ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Tamamlandı
                              </>
                            ) : (
                              "Tamamla"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Haftalık İlerleme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={getWeeklyProgress()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Bar dataKey="completed" fill="#8b5cf6" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Toplam İstatistikler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Alışkanlık:</span>
                    <span className="font-semibold">{habits.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">En Uzun Seri:</span>
                    <span className="font-semibold">{Math.max(...habits.map((h) => h.streak), 0)} gün</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bu Hafta Tamamlanan:</span>
                    <span className="font-semibold">
                      {getWeeklyProgress().reduce((sum, day) => sum + day.completed, 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Motivasyon Notu</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 italic">
                    "Her küçük adım, büyük değişimlerin başlangıcıdır. Kendine sabırlı ol, ilerleme her zaman doğrusal
                    değildir. Önemli olan vazgeçmemek. 💙"
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Mood Tab */}
          <TabsContent value="mood" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Duygu Takibi</h2>
              <Dialog open={isAddingMood} onOpenChange={setIsAddingMood}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Heart className="w-4 h-4 mr-2" />
                    Bugünkü Ruh Halim
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bugün Nasıl Hissediyorsun?</DialogTitle>
                    <DialogDescription>Duygularını takip etmek öz-farkındalığını artırır</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Ruh Hali (1-5)</Label>
                      <Select
                        value={newMood.mood.toString()}
                        onValueChange={(value) => setNewMood({ ...newMood, mood: Number.parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(MOOD_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="mood-note">Not (İsteğe bağlı)</Label>
                      <Textarea
                        id="mood-note"
                        value={newMood.note}
                        onChange={(e) => setNewMood({ ...newMood, note: e.target.value })}
                        placeholder="Bugün seni etkileyen şeyler..."
                      />
                    </div>
                    <Button onClick={addMoodEntry} className="w-full">
                      Kaydet
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {moodEntries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ruh Hali Trendi</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={getMoodChart()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[1, 5]} />
                      <Line type="monotone" dataKey="mood" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h3 className="font-medium text-blue-800 mb-2">💙 Öz-Şefkat Hatırlatması</h3>
                <p className="text-sm text-blue-700">
                  Zor günlerde kendine karşı eleştirel olmak yerine, en iyi arkadaşına davrandığın gibi kendine de nazik
                  davran. Duygusal dalgalanmalar normaldir ve geçicidir.
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              {moodEntries
                .slice(-5)
                .reverse()
                .map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{MOOD_LABELS[entry.mood as keyof typeof MOOD_LABELS]}</Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(entry.date).toLocaleDateString("tr-TR")}
                            </span>
                          </div>
                          {entry.note && <p className="text-sm text-gray-600 mt-2">{entry.note}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
