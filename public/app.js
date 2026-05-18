const state = {
  emails: [],
  resume: null,
  reports: [],
  selectedEmailIds: new Set(),
  activeScreen: 'dashboard',
};

const elements = {
  apiStatus: document.getElementById('apiStatus'),
  screenTitle: document.getElementById('screenTitle'),
  refreshButton: document.getElementById('refreshButton'),
  navTabs: document.querySelectorAll('.nav-tab'),
  screens: document.querySelectorAll('.screen'),
  totalEmails: document.getElementById('totalEmails'),
  pendingEmails: document.getElementById('pendingEmails'),
  sentEmails: document.getElementById('sentEmails'),
  failedEmails: document.getElementById('failedEmails'),
  skippedEmails: document.getElementById('skippedEmails'),
  latestResumeCard: document.getElementById('latestResumeCard'),
  recentEmailRows: document.getElementById('recentEmailRows'),
  emailRows: document.getElementById('emailRows'),
  reportRows: document.getElementById('reportRows'),
  emailSearch: document.getElementById('emailSearch'),
  statusFilter: document.getElementById('statusFilter'),
  selectAllEmails: document.getElementById('selectAllEmails'),
  emailTableCount: document.getElementById('emailTableCount'),
  selectedEmailCount: document.getElementById('selectedEmailCount'),
  bulkSkipButton: document.getElementById('bulkSkipButton'),
  bulkUnskipButton: document.getElementById('bulkUnskipButton'),
  bulkDeleteButton: document.getElementById('bulkDeleteButton'),
  singleEmailForm: document.getElementById('singleEmailForm'),
  singleEmail: document.getElementById('singleEmail'),
  singleName: document.getElementById('singleName'),
  singleCompany: document.getElementById('singleCompany'),
  singleEmailResult: document.getElementById('singleEmailResult'),
  emailUploadForm: document.getElementById('emailUploadForm'),
  emailFile: document.getElementById('emailFile'),
  emailUploadResult: document.getElementById('emailUploadResult'),
  resumeUploadForm: document.getElementById('resumeUploadForm'),
  resumeFile: document.getElementById('resumeFile'),
  resumeUploadResult: document.getElementById('resumeUploadResult'),
  resumeDetails: document.getElementById('resumeDetails'),
  resumePreview: document.getElementById('resumePreview'),
  readyToSend: document.getElementById('readyToSend'),
  resumeReady: document.getElementById('resumeReady'),
  resendSentCheckbox: document.getElementById('resendSentCheckbox'),
  sendEmailsButton: document.getElementById('sendEmailsButton'),
  sendResult: document.getElementById('sendResult'),
  toast: document.getElementById('toast'),
};

const api = async (url, options = {}) => {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({
    success: false,
    message: 'Invalid server response',
    data: null,
  }));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
};

const showToast = (message) => {
  elements.toast.textContent = message;
  elements.toast.classList.remove('hidden');

  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.add('hidden');
  }, 3200);
};

const setResult = (node, message, type = 'success') => {
  node.textContent = message;
  node.className = `result-box ${type}`;
};

const clearResult = (node) => {
  node.textContent = '';
  node.className = 'result-box hidden';
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const escapeHtml = (value) => {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const statusBadge = (status) => {
  return `<span class="status ${escapeHtml(status)}">${escapeHtml(status)}</span>`;
};

const getCounts = () => {
  return state.emails.reduce(
    (counts, email) => {
      counts.total += 1;
      counts[email.status] = (counts[email.status] || 0) + 1;
      return counts;
    },
    { total: 0, pending: 0, sent: 0, failed: 0, skipped: 0 }
  );
};

const getFilteredEmails = () => {
  const selectedStatus = elements.statusFilter.value;
  const searchText = elements.emailSearch.value.trim().toLowerCase();

  return state.emails.filter((email) => {
    const matchesStatus = selectedStatus ? email.status === selectedStatus : true;
    const searchableText = [email.email, email.name, email.company, email.status]
      .join(' ')
      .toLowerCase();
    const matchesSearch = searchText ? searchableText.includes(searchText) : true;

    return matchesStatus && matchesSearch;
  });
};

const syncSelectionState = () => {
  const existingIds = new Set(state.emails.map((email) => email._id));
  state.selectedEmailIds.forEach((id) => {
    if (!existingIds.has(id)) {
      state.selectedEmailIds.delete(id);
    }
  });
};

const renderBulkSelection = (visibleEmails = getFilteredEmails()) => {
  const visibleIds = visibleEmails.map((email) => email._id);
  const selectedVisibleCount = visibleIds.filter((id) => state.selectedEmailIds.has(id)).length;
  const selectedCount = state.selectedEmailIds.size;

  elements.emailTableCount.textContent =
    visibleEmails.length === state.emails.length
      ? `${state.emails.length} total`
      : `${visibleEmails.length} visible of ${state.emails.length} total`;
  elements.selectedEmailCount.textContent = `${selectedCount} selected`;
  elements.bulkSkipButton.disabled = selectedCount === 0;
  elements.bulkUnskipButton.disabled = selectedCount === 0;
  elements.bulkDeleteButton.disabled = selectedCount === 0;
  elements.selectAllEmails.checked = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  elements.selectAllEmails.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleIds.length;
};

const renderDashboard = () => {
  const counts = getCounts();

  elements.totalEmails.textContent = counts.total;
  elements.pendingEmails.textContent = counts.pending;
  elements.sentEmails.textContent = counts.sent;
  elements.failedEmails.textContent = counts.failed;
  elements.skippedEmails.textContent = counts.skipped;
  elements.readyToSend.textContent = elements.resendSentCheckbox.checked
    ? counts.total - counts.skipped
    : counts.pending + counts.failed;
  elements.resumeReady.textContent = state.resume ? 'Ready' : 'Missing';

  elements.latestResumeCard.innerHTML = state.resume
    ? renderResumeCard(state.resume)
    : 'No resume uploaded yet.';

  const recent = state.emails.slice(0, 6);
  elements.recentEmailRows.innerHTML = recent.length
    ? recent
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.email)}</td>
              <td>${statusBadge(item.status)}</td>
            </tr>
          `
        )
        .join('')
    : '<tr><td colspan="2">No email records found.</td></tr>';
};

const renderResumeCard = (resume) => {
  const fileUrl = getResumeUrl(resume);

  return `
    <div class="resume-card">
      <strong>${escapeHtml(resume.fileName)}</strong><br />
      Uploaded: ${formatDate(resume.uploadedAt)}<br />
      Path: ${escapeHtml(resume.filePath)}
      <div class="resume-card-actions">
        <a class="link-button" href="${fileUrl}" target="_blank" rel="noopener">Open Resume</a>
      </div>
    </div>
  `;
};

const getResumeUrl = (resume) => {
  return `/uploads/${encodeURIComponent(resume.fileName)}`;
};

const renderEmails = () => {
  syncSelectionState();
  const records = getFilteredEmails();

  elements.emailRows.innerHTML = records.length
    ? records
        .map(
          (item) => `
            <tr>
              <td>
                <input
                  class="email-select-checkbox"
                  type="checkbox"
                  data-select-email-id="${escapeHtml(item._id)}"
                  ${state.selectedEmailIds.has(item._id) ? 'checked' : ''}
                />
              </td>
              <td>${escapeHtml(item.email)}</td>
              <td>${escapeHtml(item.name || '-')}</td>
              <td>${escapeHtml(item.company || '-')}</td>
              <td>${statusBadge(item.status)}</td>
              <td>${formatDate(item.lastSentAt)}</td>
              <td class="error-text">${escapeHtml(item.error || '-')}</td>
              <td>
                <div class="action-group">
                  <button
                    class="small-muted-button"
                    type="button"
                    data-skip-email-id="${escapeHtml(item._id)}"
                    data-skip-email-value="${item.status === 'skipped' ? 'false' : 'true'}"
                  >
                    ${item.status === 'skipped' ? 'Unskip' : 'Skip'}
                  </button>
                  <button class="small-danger-button" type="button" data-delete-email-id="${escapeHtml(item._id)}">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          `
        )
        .join('')
    : '<tr><td colspan="8">No email records match your search or status filter.</td></tr>';

  renderBulkSelection(records);
};

const renderReports = () => {
  elements.reportRows.innerHTML = state.reports.length
    ? state.reports
        .map(
          (report) => `
            <tr>
              <td>${escapeHtml(report.dateKey)}</td>
              <td>${report.totalRuns}</td>
              <td>${report.totalEligible}</td>
              <td>${report.successCount}</td>
              <td>${report.failedCount}</td>
              <td>${report.skippedSentCount}</td>
              <td>${report.resentSentCount}</td>
            </tr>
          `
        )
        .join('')
    : '<tr><td colspan="7">No email send reports yet.</td></tr>';
};

const renderResume = () => {
  elements.resumeDetails.innerHTML = state.resume
    ? renderResumeCard(state.resume)
    : 'No resume uploaded yet.';

  if (!state.resume) {
    elements.resumePreview.innerHTML = 'No resume uploaded yet.';
    return;
  }

  const fileUrl = getResumeUrl(state.resume);
  const isPdf = state.resume.fileName.toLowerCase().endsWith('.pdf');

  elements.resumePreview.innerHTML = isPdf
    ? `<iframe title="Resume preview" src="${fileUrl}"></iframe>`
    : `
      <div>
        This file type cannot be previewed directly in every browser.
        <div class="resume-card-actions">
          <a class="link-button" href="${fileUrl}" target="_blank" rel="noopener">Open Resume</a>
        </div>
      </div>
    `;
};

const renderAll = () => {
  renderDashboard();
  renderEmails();
  renderResume();
  renderReports();
};

const loadHealth = async () => {
  try {
    await api('/api/health');
    elements.apiStatus.textContent = 'Online';
  } catch (error) {
    elements.apiStatus.textContent = 'Offline';
  }
};

const loadEmails = async () => {
  const payload = await api('/api/emails');
  state.emails = payload.data || [];
};

const loadResume = async () => {
  try {
    const payload = await api('/api/resume');
    state.resume = payload.data;
  } catch (error) {
    state.resume = null;
  }
};

const loadReports = async () => {
  const payload = await api('/api/reports');
  state.reports = payload.data || [];
};

const refreshData = async () => {
  elements.refreshButton.disabled = true;

  try {
    await Promise.all([loadHealth(), loadEmails(), loadResume(), loadReports()]);
    renderAll();
  } catch (error) {
    showToast(error.message);
  } finally {
    elements.refreshButton.disabled = false;
  }
};

const switchScreen = (screenId) => {
  state.activeScreen = screenId;
  const title = screenId.charAt(0).toUpperCase() + screenId.slice(1);
  elements.screenTitle.textContent = title === 'Sender' ? 'Send Emails' : title;

  elements.navTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.screen === screenId);
  });

  elements.screens.forEach((screen) => {
    screen.classList.toggle('active', screen.id === screenId);
  });
};

const uploadEmails = async (event) => {
  event.preventDefault();
  clearResult(elements.emailUploadResult);

  if (!elements.emailFile.files.length) return;

  const button = event.submitter;
  const formData = new FormData();
  formData.append('file', elements.emailFile.files[0]);
  button.disabled = true;

  try {
    const payload = await api('/api/emails/upload', {
      method: 'POST',
      body: formData,
    });

    const result = payload.data;
    setResult(
      elements.emailUploadResult,
      `Inserted: ${result.insertedCount}\nDuplicates: ${result.duplicateCount}\nInvalid: ${result.invalidCount}\nProcessed: ${result.totalProcessed}`
    );
    elements.emailUploadForm.reset();
    await refreshData();
  } catch (error) {
    setResult(elements.emailUploadResult, error.message, 'error');
  } finally {
    button.disabled = false;
  }
};

const deleteEmail = async (emailId) => {
  const confirmed = window.confirm('Delete this email address from the list?');

  if (!confirmed) return;

  try {
    await api(`/api/emails/${emailId}`, {
      method: 'DELETE',
    });
    showToast('Email deleted successfully.');
    await refreshData();
  } catch (error) {
    showToast(error.message);
  }
};

const bulkDeleteEmails = async () => {
  const ids = Array.from(state.selectedEmailIds);
  const confirmed = window.confirm(`Delete ${ids.length} selected email address(es)?`);

  if (!confirmed) return;

  try {
    await api('/api/emails/bulk', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    state.selectedEmailIds.clear();
    showToast('Selected emails deleted successfully.');
    await refreshData();
  } catch (error) {
    showToast(error.message);
  }
};

const updateEmailSkipStatus = async (emailId, shouldSkip) => {
  try {
    await api(`/api/emails/${emailId}/skip`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skip: shouldSkip,
      }),
    });
    showToast(shouldSkip ? 'Email skipped.' : 'Email restored.');
    await refreshData();
  } catch (error) {
    showToast(error.message);
  }
};

const bulkUpdateEmailSkipStatus = async (shouldSkip) => {
  const ids = Array.from(state.selectedEmailIds);

  try {
    await api('/api/emails/bulk/skip', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ids,
        skip: shouldSkip,
      }),
    });
    state.selectedEmailIds.clear();
    showToast(shouldSkip ? 'Selected emails skipped.' : 'Selected emails restored.');
    await refreshData();
  } catch (error) {
    showToast(error.message);
  }
};

const addSingleEmail = async (event) => {
  event.preventDefault();
  clearResult(elements.singleEmailResult);

  const button = event.submitter;
  button.disabled = true;

  try {
    const payload = await api('/api/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: elements.singleEmail.value,
        name: elements.singleName.value,
        company: elements.singleCompany.value,
      }),
    });

    setResult(
      elements.singleEmailResult,
      payload.data.inserted ? 'Email added successfully.' : 'Email already exists. Duplicate skipped.'
    );
    elements.singleEmailForm.reset();
    await refreshData();
  } catch (error) {
    setResult(elements.singleEmailResult, error.message, 'error');
  } finally {
    button.disabled = false;
  }
};

const uploadResume = async (event) => {
  event.preventDefault();
  clearResult(elements.resumeUploadResult);

  if (!elements.resumeFile.files.length) return;

  const button = event.submitter;
  const formData = new FormData();
  formData.append('resume', elements.resumeFile.files[0]);
  button.disabled = true;

  try {
    const payload = await api('/api/resume/upload', {
      method: 'POST',
      body: formData,
    });

    setResult(elements.resumeUploadResult, `Uploaded: ${payload.data.fileName}`);
    elements.resumeUploadForm.reset();
    await refreshData();
  } catch (error) {
    setResult(elements.resumeUploadResult, error.message, 'error');
  } finally {
    button.disabled = false;
  }
};

const sendEmails = async () => {
  clearResult(elements.sendResult);
  elements.sendEmailsButton.disabled = true;
  elements.sendEmailsButton.textContent = 'Sending...';

  try {
    const payload = await api('/api/send-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        includeSent: elements.resendSentCheckbox.checked,
      }),
    });

    setResult(elements.sendResult, 'Bulk email job started. Keep this page open or refresh status after a few seconds.');
    await refreshData();

    const pollJob = async () => {
      const statusPayload = await api('/api/send-emails/status');
      const job = statusPayload.data;

      if (job.error) {
        setResult(elements.sendResult, job.error, 'error');
        await refreshData();
        return;
      }

      if (job.running) {
        setResult(elements.sendResult, 'Bulk email job is running...');
        window.setTimeout(pollJob, 3000);
        return;
      }

      const result = job.summary;
      if (!result) {
        setResult(elements.sendResult, 'Bulk email job finished without a summary.');
        await refreshData();
        return;
      }

      setResult(
        elements.sendResult,
        `Eligible: ${result.totalEligible}\nSent: ${result.successCount}\nFailed: ${result.failedCount}\nSkipped sent: ${result.skippedSentCount}\nResent already sent: ${result.resentSentCount}`
      );
      await refreshData();
    };

    window.setTimeout(pollJob, 3000);
  } catch (error) {
    setResult(elements.sendResult, error.message, 'error');
  } finally {
    elements.sendEmailsButton.disabled = false;
    elements.sendEmailsButton.textContent = 'Start Bulk Send';
  }
};

elements.navTabs.forEach((tab) => {
  tab.addEventListener('click', () => switchScreen(tab.dataset.screen));
});

elements.refreshButton.addEventListener('click', refreshData);
elements.emailSearch.addEventListener('input', renderEmails);
elements.statusFilter.addEventListener('change', renderEmails);
elements.selectAllEmails.addEventListener('change', () => {
  const visibleEmails = getFilteredEmails();

  visibleEmails.forEach((email) => {
    if (elements.selectAllEmails.checked) {
      state.selectedEmailIds.add(email._id);
    } else {
      state.selectedEmailIds.delete(email._id);
    }
  });

  renderEmails();
});
elements.bulkSkipButton.addEventListener('click', () => bulkUpdateEmailSkipStatus(true));
elements.bulkUnskipButton.addEventListener('click', () => bulkUpdateEmailSkipStatus(false));
elements.bulkDeleteButton.addEventListener('click', bulkDeleteEmails);
elements.resendSentCheckbox.addEventListener('change', renderDashboard);
elements.emailRows.addEventListener('click', (event) => {
  const selectCheckbox = event.target.closest('[data-select-email-id]');

  if (selectCheckbox) {
    if (selectCheckbox.checked) {
      state.selectedEmailIds.add(selectCheckbox.dataset.selectEmailId);
    } else {
      state.selectedEmailIds.delete(selectCheckbox.dataset.selectEmailId);
    }

    renderBulkSelection();
    return;
  }

  const button = event.target.closest('[data-delete-email-id]');

  if (button) {
    deleteEmail(button.dataset.deleteEmailId);
    return;
  }

  const skipButton = event.target.closest('[data-skip-email-id]');

  if (skipButton) {
    updateEmailSkipStatus(skipButton.dataset.skipEmailId, skipButton.dataset.skipEmailValue === 'true');
  }
});
elements.singleEmailForm.addEventListener('submit', addSingleEmail);
elements.emailUploadForm.addEventListener('submit', uploadEmails);
elements.resumeUploadForm.addEventListener('submit', uploadResume);
elements.sendEmailsButton.addEventListener('click', sendEmails);

refreshData();
