"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type PhaseSchedule = {
  phase: string;
  startDate: Date;
  endDate: Date;
  deadline: Date | null;
};

type Milestone = {
  id: string;
  name: string;
  phase: string;
  description: string | null;
};

type MilestoneProgress = {
  id: string;
  completed: boolean;
  completedAt: Date | null;
  milestone: Milestone;
};

type Progression = {
  currentPhase: string;
  milestones: MilestoneProgress[];
};

type User = {
  id: string;
  name: string | null;
  careerGroup: {
    name: string;
    phaseSchedules: PhaseSchedule[];
  } | null;
  progression: Progression | null;
};

type Props = {
  user: User | null;
  allMilestones: Milestone[];
};

const phases = [
  { id: "PHASE_1", name: "FAS 1: Intro", description: "Research, CV & LinkedIn, Big Bang Day" },
  { id: "PHASE_2", name: "FAS 2: Nätverkande", description: "Kontakter, studiebesök, mingle" },
  { id: "PHASE_3", name: "FAS 3: LIA-sök", description: "Hitta din LIA-plats" },
  { id: "PHASE_4", name: "FAS 4: Jobb-sök", description: "Karriärstart efter examen" },
];

const phaseColors: Record<string, string> = {
  PHASE_1: "bg-blue-500",
  PHASE_2: "bg-green-500",
  PHASE_3: "bg-yellow-500",
  PHASE_4: "bg-purple-500",
};

export function ProgressionView({ user, allMilestones }: Props) {
  const [expandedPhases, setExpandedPhases] = useState<string[]>([
    user?.progression?.currentPhase || "PHASE_1",
  ]);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, boolean>>({});

  const currentPhase = user?.progression?.currentPhase || "PHASE_1";
  const completedMilestones = user?.progression?.milestones || [];

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) =>
      prev.includes(phaseId)
        ? prev.filter((p) => p !== phaseId)
        : [...prev, phaseId]
    );
  };

  const isMilestoneCompleted = (milestoneId: string) => {
    if (optimisticUpdates[milestoneId] !== undefined) {
      return optimisticUpdates[milestoneId];
    }
    return completedMilestones.some((m) => m.milestone.id === milestoneId && m.completed);
  };

  const toggleMilestone = async (milestoneId: string, completed: boolean) => {
    // Optimistic update
    setOptimisticUpdates((prev) => ({ ...prev, [milestoneId]: completed }));

    try {
      await fetch("/api/progression/milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, completed }),
      });
    } catch (error) {
      console.error("Failed to update milestone:", error);
      // Revert on error
      setOptimisticUpdates((prev) => {
        const newState = { ...prev };
        delete newState[milestoneId];
        return newState;
      });
    }
  };

  const getPhaseSchedule = (phaseId: string) => {
    return user?.careerGroup?.phaseSchedules.find((s) => s.phase === phaseId);
  };

  const isPhaseActive = (phaseId: string) => {
    const schedule = getPhaseSchedule(phaseId);
    if (!schedule) return false;
    const now = new Date();
    return now >= new Date(schedule.startDate) && now <= new Date(schedule.endDate);
  };

  const isPhaseFuture = (phaseId: string) => {
    const schedule = getPhaseSchedule(phaseId);
    if (!schedule) return false;
    return new Date() < new Date(schedule.startDate);
  };

  const getMilestonesForPhase = (phaseId: string) => {
    return allMilestones.filter((m) => m.phase === phaseId);
  };

  const getCompletedCount = (phaseId: string) => {
    const phaseMilestones = getMilestonesForPhase(phaseId);
    return phaseMilestones.filter((m) => isMilestoneCompleted(m.id)).length;
  };

  return (
    <div className="space-y-6">
      {/* Current Phase Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${phaseColors[currentPhase]} animate-pulse`} />
            Du är i: {phases.find((p) => p.id === currentPhase)?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {user?.careerGroup?.name || "Ingen grupp tilldelad"}
          </p>
        </CardContent>
      </Card>

      {/* Phase Timeline */}
      <div className="space-y-4">
        {phases.map((phase, index) => {
          const schedule = getPhaseSchedule(phase.id);
          const isActive = isPhaseActive(phase.id);
          const isFuture = isPhaseFuture(phase.id);
          const isExpanded = expandedPhases.includes(phase.id);
          const phaseMilestones = getMilestonesForPhase(phase.id);
          const completedCount = getCompletedCount(phase.id);

          return (
            <Card
              key={phase.id}
              className={`transition-all ${
                isActive ? "ring-2 ring-primary" : ""
              } ${isFuture ? "opacity-60" : ""}`}
            >
              <CardHeader
                className="cursor-pointer"
                onClick={() => togglePhase(phase.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Phase indicator */}
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${phaseColors[phase.id]}`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {phase.name}
                        {isActive && (
                          <Badge variant="default" className="text-xs">
                            Aktiv
                          </Badge>
                        )}
                        {isFuture && (
                          <Badge variant="secondary" className="text-xs">
                            Kommande
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {phase.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Progress indicator */}
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {completedCount}/{phaseMilestones.length}
                      </div>
                      <div className="text-xs text-muted-foreground">moment</div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>

                {/* Schedule info */}
                {schedule && (
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(schedule.startDate).toLocaleDateString("sv-SE")} -{" "}
                      {new Date(schedule.endDate).toLocaleDateString("sv-SE")}
                    </span>
                    {schedule.deadline && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Deadline: {new Date(schedule.deadline).toLocaleDateString("sv-SE")}
                      </span>
                    )}
                  </div>
                )}
              </CardHeader>

              {/* Milestones */}
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {phaseMilestones.map((milestone) => {
                      const isCompleted = isMilestoneCompleted(milestone.id);
                      return (
                        <div
                          key={milestone.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            isCompleted
                              ? "bg-green-50 border-green-200"
                              : "bg-background hover:bg-muted/50"
                          }`}
                        >
                          <Checkbox
                            id={milestone.id}
                            checked={isCompleted}
                            onCheckedChange={(checked) =>
                              toggleMilestone(milestone.id, checked as boolean)
                            }
                            disabled={isFuture}
                          />
                          <label
                            htmlFor={milestone.id}
                            className={`flex-1 cursor-pointer ${
                              isCompleted ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {milestone.name}
                          </label>
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
