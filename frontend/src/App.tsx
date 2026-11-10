import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import { Sidebar, DashboardTab } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { AuthModal } from './pages/AuthModal';
import { OverviewTab } from './dashboard/OverviewTab';
import { DatasetCollectionTab } from './dashboard/DatasetCollectionTab';
import { DataExplorerTab } from './dashboard/DataExplorerTab';
import { DataQualityTab } from './dashboard/DataQualityTab';
import { PreprocessingTab } from './dashboard/PreprocessingTab';
import { FeatureEngineeringTab } from './dashboard/FeatureEngineeringTab';
import { VisualizationsTab } from './dashboard/VisualizationsTab';
import { PipelineHistoryTab } from './dashboard/PipelineHistoryTab';
import { DocumentationPage } from './pages/DocumentationPage';
import { SettingsPage } from './pages/SettingsPage';
import { api, DatasetDetail, DatasetSummary, QualityReport } from './services/api';

const AppContent: React.FC = () => {
  const toast = useToast();

  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auth state
  const [user, setUser] = useState<{ id: number; email: string; full_name: string; role: string } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Datasets state
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string>('ds_adult_census');
  const [datasetDetail, setDatasetDetail] = useState<DatasetDetail | null>(null);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [loading, setLoading] = useState(false);

  // Check initial user from localStorage or API
  useEffect(() => {
    const savedUser = localStorage.getItem('dataforge_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    } else {
      // Load default demo user
      api.getMe().then(setUser).catch(console.error);
    }
  }, []);

  // Initial datasets fetch
  useEffect(() => {
    loadDatasetsList();
  }, []);

  // Fetch detail & quality when activeDatasetId changes
  useEffect(() => {
    if (activeDatasetId) {
      loadDatasetData(activeDatasetId);
    }
  }, [activeDatasetId]);

  const loadDatasetsList = async () => {
    try {
      const list = await api.getDatasets();
      setDatasets(list);
      if (list.length > 0 && !activeDatasetId) {
        setActiveDatasetId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadDatasetData = async (id: string) => {
    setLoading(true);
    try {
      const [detail, quality] = await Promise.all([
        api.getDataset(id),
        api.getQualityReport(id),
      ]);
      setDatasetDetail(detail);
      setQualityReport(quality);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDatasetUpdated = () => {
    if (activeDatasetId) {
      loadDatasetData(activeDatasetId);
      loadDatasetsList();
    }
  };

  const handleResetDataset = async () => {
    if (!activeDatasetId) return;
    if (!confirm('Revert active dataset back to the initial raw uploaded snapshot?')) return;
    try {
      await api.resetDataset(activeDatasetId);
      toast.info('Dataset Reset', 'Reverted back to raw state.');
      handleDatasetUpdated();
    } catch (err: any) {
      toast.error('Reset Failed', err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dataforge_token');
    localStorage.removeItem('dataforge_user');
    setUser(null);
    setCurrentView('landing');
    toast.info('Signed Out', 'You have been logged out.');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      {currentView === 'landing' ? (
        <LandingPage
          onEnterDashboard={() => setCurrentView('dashboard')}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode || 'login');
            setAuthModalOpen(true);
          }}
          onOpenDocs={() => {
            setCurrentView('dashboard');
            setCurrentTab('documentation');
          }}
          user={user}
        />
      ) : (
        <div className="flex h-screen overflow-hidden">
          {/* Collapsible Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            datasetName={datasetDetail?.name}
            totalRows={datasetDetail?.total_rows}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top Dashboard Header */}
            <Header
              currentDataset={datasets.find((d) => d.id === activeDatasetId) || null}
              datasets={datasets}
              onSelectDataset={(id) => setActiveDatasetId(id)}
              onResetDataset={handleResetDataset}
              onNavigateHome={() => setCurrentView('landing')}
              user={user}
              onLogout={handleLogout}
              qualityScore={qualityReport?.overall_score || datasetDetail?.quality_score}
            />

            {/* Scrollable View Container */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                {currentTab === 'overview' && (
                  <OverviewTab
                    datasetDetail={datasetDetail}
                    datasets={datasets}
                    qualityReport={qualityReport}
                    onNavigateTab={setCurrentTab}
                    onSelectDataset={(id) => setActiveDatasetId(id)}
                    loading={loading}
                  />
                )}

                {currentTab === 'collection' && (
                  <DatasetCollectionTab
                    activeDatasetId={activeDatasetId}
                    onDatasetLoaded={(ds) => {
                      setActiveDatasetId(ds.id);
                      handleDatasetUpdated();
                      setCurrentTab('explorer');
                    }}
                  />
                )}

                {currentTab === 'explorer' && (
                  <DataExplorerTab datasetDetail={datasetDetail} />
                )}

                {currentTab === 'quality' && (
                  <DataQualityTab
                    qualityReport={qualityReport}
                    datasetDetail={datasetDetail}
                    onNavigateTab={setCurrentTab}
                  />
                )}

                {currentTab === 'preprocessing' && (
                  <PreprocessingTab
                    datasetDetail={datasetDetail}
                    onDatasetUpdated={handleDatasetUpdated}
                  />
                )}

                {currentTab === 'features' && (
                  <FeatureEngineeringTab
                    datasetDetail={datasetDetail}
                    onDatasetUpdated={handleDatasetUpdated}
                  />
                )}

                {currentTab === 'visualizations' && (
                  <VisualizationsTab datasetDetail={datasetDetail} />
                )}

                {currentTab === 'history' && (
                  <PipelineHistoryTab datasetDetail={datasetDetail} />
                )}

                {currentTab === 'documentation' && (
                  <DocumentationPage datasetDetail={datasetDetail} />
                )}

                {currentTab === 'settings' && <SettingsPage user={user} />}
              </div>
            </main>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          setCurrentView('dashboard');
        }}
        initialMode={authModalMode}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
