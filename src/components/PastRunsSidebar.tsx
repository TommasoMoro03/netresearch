import { useState, useEffect } from "react";
import { History, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAllRuns } from "@/services/api";

interface PastRun {
  id: string;
  query: string;
  has_graph: boolean;
}

interface PastRunsSidebarProps {
  onRunClick: (runId: string, query: string) => void;
}

export const PastRunsSidebar = ({ onRunClick }: PastRunsSidebarProps) => {
  const [pastRuns, setPastRuns] = useState<PastRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPastRuns = async () => {
      try {
        const runs = await getAllRuns();
        setPastRuns(runs);
      } catch (error) {
        console.error("Failed to fetch past runs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPastRuns();
  }, []);

  return (
    <div className="fixed left-0 top-0 h-screen w-80 glass-panel border-r border-border/50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold">Past Searches</h2>
            <p className="text-xs text-muted-foreground">
              {pastRuns.length} {pastRuns.length === 1 ? "search" : "searches"}
            </p>
          </div>
        </div>
      </div>

      {/* Past Runs List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">
            Loading past searches...
          </div>
        ) : pastRuns.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No past searches yet
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {pastRuns.map((run) => (
              <button
                key={run.id}
                onClick={() => onRunClick(run.id, run.query)}
                className="w-full text-left p-4 rounded-lg glass-panel border border-border/30 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      {run.query.length > 36 ? `${run.query.substring(0, 36)}...` : run.query}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to view graph
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
