export interface DataRefreshLog {
  id: string;
  organization_id: string;
  data_type: 'transactions' | 'accounts' | 'forecasts' | 'economic_data' | 'dashboard_metrics';
  refresh_timestamp: Date;
  duration_ms: number;
  status: 'success' | 'error' | 'partial';
  error_message?: string;
  records_processed: number;
  user_id?: string;
}

class RefreshManager {
  private static instance: RefreshManager;
  private refreshLogs: Map<string, DataRefreshLog[]> = new Map();

  private constructor() {}

  public static getInstance(): RefreshManager {
    if (!RefreshManager.instance) {
      RefreshManager.instance = new RefreshManager();
    }
    return RefreshManager.instance;
  }

  public async logRefresh(log: Omit<DataRefreshLog, 'id'>): Promise<void> {
    const refreshLog: DataRefreshLog = {
      ...log,
      id: `refresh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    const orgLogs = this.refreshLogs.get(log.organization_id) || [];
    orgLogs.push(refreshLog);
    
    // Keep only last 100 refresh logs per organization
    if (orgLogs.length > 100) {
      orgLogs.splice(0, orgLogs.length - 100);
    }
    
    this.refreshLogs.set(log.organization_id, orgLogs);

    // Store in localStorage for persistence
    try {
      localStorage.setItem(
        `refresh-logs-${log.organization_id}`,
        JSON.stringify(orgLogs)
      );
    } catch (error) {
      console.warn('Failed to store refresh logs in localStorage:', error);
    }
  }

  public getLastRefresh(organizationId: string, dataType?: string): DataRefreshLog | null {
    const logs = this.getRefreshLogs(organizationId);
    
    let filteredLogs = logs;
    if (dataType) {
      filteredLogs = logs.filter(log => log.data_type === dataType);
    }

    return filteredLogs.length > 0 ? filteredLogs[filteredLogs.length - 1] : null;
  }

  public getRefreshLogs(organizationId: string): DataRefreshLog[] {
    // Try to load from localStorage first
    try {
      const storedLogs = localStorage.getItem(`refresh-logs-${organizationId}`);
      if (storedLogs) {
        const logs = JSON.parse(storedLogs);
        // Convert timestamp strings back to Date objects
        const refreshLogs = logs.map((log: any) => ({
          ...log,
          refresh_timestamp: new Date(log.refresh_timestamp)
        }));
        this.refreshLogs.set(organizationId, refreshLogs);
        return refreshLogs;
      }
    } catch (error) {
      console.warn('Failed to load refresh logs from localStorage:', error);
    }

    return this.refreshLogs.get(organizationId) || [];
  }

  public async performRefresh(
    organizationId: string,
    dataType: DataRefreshLog['data_type'],
    refreshFunction: () => Promise<{ recordsProcessed: number }>,
    userId?: string
  ): Promise<DataRefreshLog> {
    const startTime = Date.now();
    const refreshTimestamp = new Date();

    try {
      const result = await refreshFunction();
      const duration = Date.now() - startTime;

      const log: Omit<DataRefreshLog, 'id'> = {
        organization_id: organizationId,
        data_type: dataType,
        refresh_timestamp: refreshTimestamp,
        duration_ms: duration,
        status: 'success',
        records_processed: result.recordsProcessed,
        user_id: userId
      };

      await this.logRefresh(log);
      return { ...log, id: `refresh-${Date.now()}` };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      const log: Omit<DataRefreshLog, 'id'> = {
        organization_id: organizationId,
        data_type: dataType,
        refresh_timestamp: refreshTimestamp,
        duration_ms: duration,
        status: 'error',
        error_message: errorMessage,
        records_processed: 0,
        user_id: userId
      };

      await this.logRefresh(log);
      throw error;
    }
  }

  public getRefreshStatus(organizationId: string): {
    lastDashboardRefresh: Date | null;
    lastTransactionRefresh: Date | null;
    lastEconomicDataRefresh: Date | null;
    isAnyRefreshing: boolean;
  } {
    const logs = this.getRefreshLogs(organizationId);
    
    const dashboardRefresh = logs
      .filter(log => log.data_type === 'dashboard_metrics')
      .sort((a, b) => b.refresh_timestamp.getTime() - a.refresh_timestamp.getTime())[0];
    
    const transactionRefresh = logs
      .filter(log => log.data_type === 'transactions')
      .sort((a, b) => b.refresh_timestamp.getTime() - a.refresh_timestamp.getTime())[0];
    
    const economicDataRefresh = logs
      .filter(log => log.data_type === 'economic_data')
      .sort((a, b) => b.refresh_timestamp.getTime() - a.refresh_timestamp.getTime())[0];

    // Check if any refresh is currently running (within last 30 seconds)
    const thirtySecondsAgo = new Date(Date.now() - 30000);
    const isAnyRefreshing = logs.some(log => 
      log.refresh_timestamp > thirtySecondsAgo && log.status !== 'success' && log.status !== 'error'
    );

    return {
      lastDashboardRefresh: dashboardRefresh?.refresh_timestamp || null,
      lastTransactionRefresh: transactionRefresh?.refresh_timestamp || null,
      lastEconomicDataRefresh: economicDataRefresh?.refresh_timestamp || null,
      isAnyRefreshing
    };
  }

  public clearRefreshLogs(organizationId: string): void {
    this.refreshLogs.delete(organizationId);
    try {
      localStorage.removeItem(`refresh-logs-${organizationId}`);
    } catch (error) {
      console.warn('Failed to clear refresh logs from localStorage:', error);
    }
  }
}

export const refreshManager = RefreshManager.getInstance();