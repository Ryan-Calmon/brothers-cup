import { Card, Button, Spinner } from "../../Components/ui";

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ServerStatusCard({ status, isLoading, onRefresh }) {
  if (!status) return null;

  const isOnline = status.status === "online";

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-brand-200">
          🖥️ Status do Servidor
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? <Spinner size="sm" /> : "🔄"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-green-400 animate-pulse" : "bg-red-500"
            }`}
          />
          <span className={isOnline ? "text-green-400" : "text-red-400"}>
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        {isOnline && (
          <>
            <div className="text-brand-200/60">
              Uptime: <span className="text-brand-200">{formatUptime(status.uptime)}</span>
            </div>
            <div className="text-brand-200/60">
              DB:{" "}
              <span
                className={
                  status.database?.status === "online"
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {status.database?.status === "online" ? "🟢" : "🔴"}{" "}
                {status.database?.latency && `${status.database.latency}`}
              </span>
            </div>
          </>
        )}

        {!isOnline && (
          <span className="text-red-400">{status.message || "Indisponível"}</span>
        )}
      </div>
    </Card>
  );
}
