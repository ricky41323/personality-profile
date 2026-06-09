// ============================================================
// App Logic - Personality Profile Generator (v2)
// Multi-Enneagram (Top 3 + Bottom 3) + Friendship Tips
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profileForm');
  const nameInput = document.getElementById('nameInput');
  const mbtiInput = document.getElementById('mbtiInput');
  const enneaInput = document.getElementById('enneaInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const inputSection = document.getElementById('inputSection');
  const resultsSection = document.getElementById('resultsSection');
  const validationMsg = document.getElementById('validationMsg');

  function parseMBTI(val) {
    if(!val) return null;
    const cleaned = val.replace(/\([^)]*\)/g, '').toUpperCase();
    const match = cleaned.match(/[IE][SN][TF][JP]/);
    return match ? match[0] : null;
  }

  function parseEnnea(val) {
    if(!val) return null;
    const digits = val.replace(/\D/g, '');
    if (digits.length >= 3) {
      return [parseInt(digits[0]), parseInt(digits[1]), parseInt(digits[2])];
    }
    return null;
  }

  function validateForm() {
    const nameValid = nameInput.value.trim() !== '';
    const mbti = parseMBTI(mbtiInput.value);
    const ennea = parseEnnea(enneaInput.value);
    
    let errorMsg = '';
    if (mbtiInput.value.trim() !== '' && !mbti) {
      errorMsg = '⚠️ 올바른 MBTI 형식이 아닙니다. (예: ISFJ)';
    } else if (enneaInput.value.trim() !== '' && !ennea) {
      errorMsg = '⚠️ 에니어그램은 최소 3개의 숫자가 포함되어야 합니다. (예: 619)';
    } else if (ennea) {
      const unique = new Set(ennea);
      if (unique.size !== 3) {
        errorMsg = '⚠️ 에니어그램 상위 3유형은 서로 달라야 합니다.';
      }
    }

    validationMsg.textContent = errorMsg;
    const isValid = nameValid && !!mbti && !!ennea && errorMsg === '';
    analyzeBtn.disabled = !isValid;
    return isValid;
  }

  nameInput.addEventListener('input', validateForm);
  mbtiInput.addEventListener('input', validateForm);
  enneaInput.addEventListener('input', validateForm);

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const name = nameInput.value.trim();
    const mbtiType = parseMBTI(mbtiInput.value);
    const topTypes = parseEnnea(enneaInput.value);
    const bottomTypes = []; // Removed bottom types

    const coreEmotions = Array.from(document.querySelectorAll('input[name="coreEmotions"]:checked')).map(cb => parseInt(cb.value));
    const coreBeliefs = Array.from(document.querySelectorAll('input[name="coreBeliefs"]:checked')).map(cb => parseInt(cb.value));
    const defenseMechanisms = Array.from(document.querySelectorAll('input[name="defenseMechanisms"]:checked')).map(cb => parseInt(cb.value));

    generateProfile(name, mbtiType, topTypes, bottomTypes, coreEmotions, coreBeliefs, defenseMechanisms);
  });

  function generateProfile(name, mbtiType, topTypes, bottomTypes, coreEmotions, coreBeliefs, defenseMechanisms) {
    const mbti = MBTI_DATA[mbtiType];
    if (!mbti) return;

    const topEnneaData = topTypes.map(t => ({ type: t, data: ENNEAGRAM_DATA[t], ext: typeof ENNEAGRAM_EXTENDED !== 'undefined' ? ENNEAGRAM_EXTENDED[t] : null }));
    const bottomEnneaData = bottomTypes.map(t => ({ type: t, data: ENNEAGRAM_DATA[t], ext: typeof ENNEAGRAM_EXTENDED !== 'undefined' ? ENNEAGRAM_EXTENDED[t] : null }));

    let html = '';

    // ── Profile Header ──
    html += `
      <div class="profile-header animate-in">
        <h2 class="profile-header__name">${escapeHtml(name)}</h2>
        <div class="profile-header__badges">
          <span class="badge badge--mbti">${mbti.emoji} ${mbtiType} · ${mbti.name}</span>
          ${topEnneaData.map((e, i) => `
            <span class="badge badge--enneagram">${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} ${e.type}유형 ${e.data.name}</span>
          `).join('')}
        </div>
      </div>
      <!-- Section: MBTI & Enneagram -->
      <div class="section-title">✨ 기본 성향 분석</div>
    `;

    // ── Enneagram: All Top 3 Type Cards ──
    html += `<div class="result-cards">`;
    topEnneaData.forEach((e, i) => {
      const rankLabel = i === 0 ? '1순위 (주 유형)' : i === 1 ? '2순위' : '3순위';
      const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
      html += `
        <div class="result-card result-card--enneagram ennea-${e.type} animate-in">
          <div class="result-card__header">
            <div class="result-card__icon">${e.data.emoji}</div>
            <div>
              <div class="result-card__title">${rankEmoji} 에니어그램 ${e.type}유형 (${rankLabel})</div>
              <div class="result-card__subtitle">${e.data.name}</div>
            </div>
          </div>

          <p class="result-card__description">${e.data.description}</p>

          <div class="trait-section">
            <div class="trait-section__title">핵심 욕구</div>
            <p class="result-card__description" style="margin-bottom:0">${e.data.coreDesire}</p>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">핵심 두려움</div>
            <p class="result-card__description" style="margin-bottom:0">${e.data.coreFear}</p>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">핵심 동기</div>
            <p class="result-card__description" style="margin-bottom:0">${e.data.coreMotivation}</p>
          </div>

          <div class="trait-section">
            <div class="trait-section__title">키워드</div>
            <div class="trait-tags">
              ${e.data.keywords.map(k => `<span class="trait-tag trait-tag--keyword">${k}</span>`).join('')}
            </div>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">강점</div>
            <div class="trait-tags">
              ${e.data.strengths.map(s => `<span class="trait-tag trait-tag--strength">${s}</span>`).join('')}
            </div>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">약점</div>
            <div class="trait-tags">
              ${e.data.weaknesses.map(w => `<span class="trait-tag trait-tag--weakness">${w}</span>`).join('')}
            </div>
          </div>

          <div class="trait-section">
            <div class="trait-section__title">성장 방향</div>
            <ul class="detail-list">
              <li class="detail-list__item">
                <span class="detail-list__icon detail-list__icon--growth">📈</span>
                <span>${e.data.growthDirection}</span>
              </li>
            </ul>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">스트레스 방향</div>
            <ul class="detail-list">
              <li class="detail-list__item">
                <span class="detail-list__icon detail-list__icon--stress">📉</span>
                <span>${e.data.stressDirection}</span>
              </li>
            </ul>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">소통 가이드</div>
            <ul class="detail-list">
              ${e.data.communicationTips.map(tip => `
                <li class="detail-list__item">
                  <span class="detail-list__icon detail-list__icon--tip">💡</span>
                  <span>${tip}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;
    });

    // ── MBTI Card ──
    html += `
        <div class="result-card result-card--mbti animate-in">
          <div class="result-card__header">
            <div class="result-card__icon">${mbti.emoji}</div>
            <div>
              <div class="result-card__title">${mbtiType}</div>
              <div class="result-card__subtitle">${mbti.name} · ${mbti.group}</div>
            </div>
          </div>

          <p class="result-card__description">${mbti.description}</p>

          <div class="trait-section">
            <div class="trait-section__title">인지 기능</div>
            <p class="result-card__description" style="margin-bottom:0">${mbti.functions}</p>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">키워드</div>
            <div class="trait-tags">
              ${mbti.keywords.map(k => `<span class="trait-tag trait-tag--keyword">${k}</span>`).join('')}
            </div>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">강점</div>
            <div class="trait-tags">
              ${mbti.strengths.map(s => `<span class="trait-tag trait-tag--strength">${s}</span>`).join('')}
            </div>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">약점</div>
            <div class="trait-tags">
              ${mbti.weaknesses.map(w => `<span class="trait-tag trait-tag--weakness">${w}</span>`).join('')}
            </div>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">소통 스타일</div>
            <ul class="detail-list">
              <li class="detail-list__item">
                <span class="detail-list__icon detail-list__icon--tip">🗣️</span>
                <span>${mbti.communicationStyle}</span>
              </li>
            </ul>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">업무 스타일</div>
            <ul class="detail-list">
              <li class="detail-list__item">
                <span class="detail-list__icon detail-list__icon--tip">💼</span>
                <span>${mbti.workStyle}</span>
              </li>
            </ul>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">관계 스타일</div>
            <ul class="detail-list">
              <li class="detail-list__item">
                <span class="detail-list__icon detail-list__icon--tip">❤️</span>
                <span>${mbti.relationshipStyle}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    `;

    // ── Comprehensive Enneagram Synthesis ──
    html += `
      <div class="synergy-card animate-in" style="margin-top:24px;">
        <div class="synergy-card__header">
          <div class="synergy-card__icon">🔍</div>
          <div>
            <div class="synergy-card__title">에니어그램 종합 분석</div>
            <div class="synergy-card__subtitle">상위 3유형을 통한 통합적 해석</div>
          </div>
        </div>
        <div class="synergy-card__body">
          <div class="synergy-item">
            <div class="synergy-item__label">📌 핵심 성향 요약</div>
            <div class="synergy-item__text">
              <strong>${escapeHtml(name)}</strong>님은 <strong>${topEnneaData[0].type}유형(${topEnneaData[0].data.name})</strong>을 주축으로,
              <strong>${topEnneaData[1].type}유형(${topEnneaData[1].data.name})</strong>과
              <strong>${topEnneaData[2].type}유형(${topEnneaData[2].data.name})</strong>의 특성이 복합적으로 나타나는 성격 구조를 보입니다.
            </div>
          </div>
          <div class="synergy-item">
            <div class="synergy-item__label">💡 주요 욕구 패턴</div>
            <div class="synergy-item__text">
              "${topEnneaData[0].data.coreDesire}"가 가장 강한 내적 동력이며,
              여기에 "${topEnneaData[1].data.coreDesire}"와 "${topEnneaData[2].data.coreDesire}"의 욕구가 함께 작용합니다.
              이 세 가지 욕구가 조화롭게 충족될 때 가장 안정적인 상태를 유지합니다.
            </div>
          </div>
          <div class="synergy-item">
            <div class="synergy-item__label">⚡ 내면의 두려움</div>
            <div class="synergy-item__text">
              핵심적으로 "${topEnneaData[0].data.coreFear}"를 두려워하며,
              "${topEnneaData[1].data.coreFear}"와 "${topEnneaData[2].data.coreFear}"도 내면에 자리잡고 있습니다.
              스트레스 상황에서 이 두려움들이 복합적으로 작용할 수 있습니다.
            </div>
          </div>
          <div class="synergy-item">
            <div class="synergy-item__label">🌱 통합적 성장 방향</div>
            <div class="synergy-item__text">
              ${topEnneaData[0].type}유형의 성장 방향(${topEnneaData[0].data.growthDirection})을 기본으로 삼되,
              ${topEnneaData[1].type}유형의 강점과 ${topEnneaData[2].type}유형의 강점을 활용하는 것이 효과적입니다.
              서로 다른 유형의 긍정적인 면을 균형있게 발전시키는 연습을 권장합니다.
            </div>
          </div>
        </div>
      </div>
    `;

    // ── Friendship Tips Card ──
    const friendshipTips = MBTI_FRIENDSHIP_TIPS[mbtiType];
    if (friendshipTips && friendshipTips.length > 0) {
      html += `
        <div class="friendship-card animate-in">
          <div class="friendship-card__header">
            <div class="friendship-card__icon">🤝</div>
            <div>
              <div class="friendship-card__title">${mbtiType} 유형과 친해지는 법</div>
              <div class="friendship-card__subtitle">${mbti.name}과 좋은 관계를 만들기 위한 팁</div>
            </div>
          </div>
          <ul class="detail-list">
            ${friendshipTips.map(tip => `
              <li class="detail-list__item">
                <span class="detail-list__icon detail-list__icon--friend">💬</span>
                <span>${tip}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    // ── Synergy Analysis (주 유형 기준) ──
    const synergy = generateSynergyAnalysis(topTypes[0], mbtiType);
    if (synergy && synergy.length > 0) {
      html += `
        <div class="synergy-card animate-in">
          <div class="synergy-card__header">
            <div class="synergy-card__icon">🔗</div>
            <div>
              <div class="synergy-card__title">에니어그램 × MBTI 통합 분석</div>
              <div class="synergy-card__subtitle">${topTypes[0]}유형(주) + ${mbtiType} 조합의 역동</div>
            </div>
          </div>
          <div class="synergy-card__body">
            ${synergy.map(item => `
              <div class="synergy-item">
                <div class="synergy-item__label">${item.label}</div>
                <div class="synergy-item__text">${item.text}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // ── Core Emotions Section ──
    if (coreEmotions.length > 0) {
      html += `
        <div class="section-title" style="margin-top:40px;">❤️ 핵심 감정 분석</div>
        <div class="result-cards">`;
      coreEmotions.forEach(id => {
        const emo = typeof CORE_EMOTIONS_DATA !== 'undefined' ? CORE_EMOTIONS_DATA[id] : null;
        if (!emo) return;
        html += `
          <div class="result-card result-card--enneagram animate-in">
            <div class="result-card__header">
              <div class="result-card__icon">❤️</div>
              <div>
                <div class="result-card__title">${emo.name}</div>
                <div class="result-card__subtitle">"${emo.selfMessage}"</div>
              </div>
            </div>
            <div class="trait-section">
              <div class="trait-section__title">이해 (발생 원인)</div>
              <p class="result-card__description">${emo.understand}</p>
            </div>
            <div class="trait-section">
              <div class="trait-section__title">보여지는 이미지</div>
              <p class="result-card__description">${emo.image}</p>
            </div>
            <div class="trait-section">
              <div class="trait-section__title">성장 및 방향 제시</div>
              <p class="result-card__description" style="color:var(--accent-emerald); font-weight:500;">${emo.direction}</p>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    // ── Core Beliefs Section ──
    if (coreBeliefs.length > 0) {
      html += `
        <div class="section-title" style="margin-top:40px;">🧠 비합리적 신념 분석</div>
        <div class="result-cards">`;
      coreBeliefs.forEach(id => {
        const bel = typeof CORE_BELIEFS_DATA !== 'undefined' ? CORE_BELIEFS_DATA[id] : null;
        if (!bel) return;
        html += `
          <div class="result-card result-card--mbti animate-in">
            <div class="result-card__header">
              <div class="result-card__icon">🧠</div>
              <div>
                <div class="result-card__title">${bel.name}</div>
                <div class="result-card__subtitle">${bel.def}</div>
              </div>
            </div>
            <div class="trait-section">
              <div class="trait-section__title">비합리적 이유</div>
              <p class="result-card__description">${bel.reason}</p>
            </div>
            <div class="trait-section">
              <div class="trait-section__title">합리적 논박 (해결책)</div>
              <p class="result-card__description" style="color:var(--accent-cyan); font-weight:500;">${bel.rebuttal}</p>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    // ── Defense Mechanisms Section ──
    if (defenseMechanisms.length > 0) {
      html += `
        <div class="section-title" style="margin-top:40px;">🛡️ 방어기재 분석</div>
        <div class="result-cards">`;
      defenseMechanisms.forEach(id => {
        const def = typeof DEFENSE_MECHANISMS_DATA !== 'undefined' ? DEFENSE_MECHANISMS_DATA[id] : null;
        if (!def) return;
        html += `
          <div class="result-card result-card--enneagram animate-in">
            <div class="result-card__header">
              <div class="result-card__icon">🛡️</div>
              <div>
                <div class="result-card__title">${def.name}</div>
                <div class="result-card__subtitle defense-group-title--${def.levelClass}">${def.level}</div>
              </div>
            </div>
            <p class="result-card__description">${def.def}</p>
            <div class="trait-section">
              <div class="trait-section__title">주요 예시</div>
              <ul class="detail-list">
                ${def.examples.map(ex => `
                  <li class="detail-list__item">
                    <span class="detail-list__icon detail-list__icon--tip">💡</span>
                    <span>${ex}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
            <div class="trait-section">
              <div class="trait-section__title">상담 멘트</div>
              <p class="result-card__description" style="color:var(--accent-purple); font-weight:500;">${def.counsel}</p>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    // ── Action Buttons ──
    html += `
      <div style="text-align: center; margin-top: 40px; display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
        <button class="btn-new" id="captureBtn" type="button" style="background: var(--gradient-primary); color: white; border: none; box-shadow: var(--shadow-sm);">
          <span>📸</span> 결과 캡쳐하기
        </button>
        <button class="btn-new" id="newAnalysisBtn" type="button">
          <span>↩️</span> 새로운 분석 시작
        </button>
      </div>
    `;

    // Render
    resultsSection.innerHTML = html;
    resultsSection.classList.add('active');
    inputSection.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // New analysis button handler
    document.getElementById('newAnalysisBtn').addEventListener('click', () => {
      resultsSection.classList.remove('active');
      resultsSection.innerHTML = '';
      inputSection.style.display = '';
      inputSection.style.animation = 'fadeInUp 0.5s ease';
      nameInput.focus();
    });

    // Capture button handler
    const captureBtn = document.getElementById('captureBtn');
    if (captureBtn) {
      captureBtn.addEventListener('click', async () => {
        const originalText = captureBtn.innerHTML;
        captureBtn.innerHTML = '<span>⏳</span> 캡쳐 중...';
        captureBtn.disabled = true;

        // Hide buttons during capture
        const actionButtons = captureBtn.parentElement;
        actionButtons.style.display = 'none';

        try {
          const canvas = await html2canvas(resultsSection, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#f8fafc'
          });
          
          const filename = `${name}_성향분석결과.png`;
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          const file = new File([blob], filename, { type: 'image/png' });

          // Web Share API를 지원하면 네이티브 공유(갤러리 저장 등) 메뉴 호출
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: '대상자 종합 분석 결과'
              });
            } catch (err) {
              // 사용자가 취소한 경우는 무시, 에러일 경우 다운로드 폴백
              if (err.name !== 'AbortError') {
                fallbackDownload(canvas, filename);
              }
            }
          } else {
            // 지원하지 않으면 일반 다운로드
            fallbackDownload(canvas, filename);
          }
        } catch (err) {
          console.error('캡쳐 실패:', err);
          alert('결과 캡쳐에 실패했습니다.');
        } finally {
          // Restore buttons
          actionButtons.style.display = 'flex';
          captureBtn.innerHTML = originalText;
          captureBtn.disabled = false;
        }
      });
    }

    function fallbackDownload(canvas, filename) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }

  // Utility: escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
