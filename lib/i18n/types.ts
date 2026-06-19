export type Locale = "zh" | "en" | "id";

export type TranslationKey =
  // Layout
  | "meta.title"
  | "meta.description"
  | "skipToContent"

  // Navbar
  | "nav.lab"
  | "nav.clips"
  | "nav.searchPlaceholder"
  | "nav.searchAriaLabel"
  | "nav.searchButton"
  | "nav.changeLang"

  // Lab page
  | "lab.title"
  | "lab.inputPlaceholder"
  | "lab.inputAriaLabel"
  | "lab.submit"
  | "lab.emptyTitle"
  | "lab.emptyDesc"
  | "lab.relatedClips"
  | "lab.loading"

  // Clips page
  | "clips.title"
  | "clips.subtitle"
  | "clips.initials"
  | "clips.initialsAria"
  | "clips.finals"
  | "clips.finalsAria"
  | "clips.currentFilter"
  | "clips.clearFilter"
  | "clips.filteredTitle"
  | "clips.allClips"
  | "clips.clipCount"
  | "clips.noResults"

  // VideoPlayer
  | "player.tongueGif"
  | "player.tongueVideo"
  | "player.noVideo"
  | "player.noVideoDesc"
  | "player.toolbar"
  | "player.prev"
  | "player.play"
  | "player.pause"
  | "player.next"
  | "player.loopOn"
  | "player.loopOff"
  | "player.slowOn"
  | "player.slowOff"
  | "player.progress"
  | "player.nowPlaying"

  // ClipCard
  | "clip.preview"

  // BilibiliModal
  | "modal.close"
  | "modal.player"
  | "modal.teachingFocus"
  | "modal.startTime"
  | "modal.duration"
  | "modal.viewOnBilibili"

  // PinyinStrip
  | "strip.character"
  | "strip.syllables"
  | "strip.nowPlaying"
  | "strip.clickToPlay"

  // Pinyin terms
  | "term.initial"
  | "term.final"

  // Landing page
  | "landing.heroTitle"
  | "landing.heroSubtitle"
  | "landing.cta"
  | "landing.feature1Title"
  | "landing.feature1Desc"
  | "landing.feature2Title"
  | "landing.feature2Desc"
  | "landing.feature3Title"
  | "landing.feature3Desc"

  // Evaluation
  | "eval.title"
  | "eval.targetWord"
  | "eval.instruction"
  | "eval.startRecording"
  | "eval.recording"
  | "eval.processing"
  | "eval.result"
  | "eval.totalScore"
  | "eval.syllableAnalysis"
  | "eval.feedback"
  | "eval.retry"
  | "eval.watchVideo"
  | "eval.correct"
  | "eval.needsImprovement"
  | "eval.initial"
  | "eval.final"
  | "eval.tone"
  | "eval.errorPermission"
  | "eval.errorNotSupported"
  | "eval.errorNoSpeech"
  | "eval.errorNetwork"
  | "eval.excellent"
  | "eval.good"
  | "eval.pass"
  | "eval.needsWork"
  | "eval.correctCount"
  | "eval.stopRecording"
  | "eval.maxTimeHint"
  | "eval.recognizedAs"
  | "eval.listenCorrect"
  | "eval.disclaimer"
  | "eval.stars"
  | "eval.star1"
  | "eval.star2"
  | "eval.star3"

  // Structured feedback
  | "eval.feedbackInitialConfusion"
  | "eval.feedbackInitialWrong"
  | "eval.feedbackFinalConfusion"
  | "eval.feedbackFinalWrong"
  | "eval.feedbackTone"
  | "eval.feedbackOverallExcellent"
  | "eval.feedbackOverallGood"
  | "eval.feedbackOverallPractice"
  | "eval.feedbackOverallNeedsWork"

  // Gamification
  | "eval.encourage1"
  | "eval.encourage2"
  | "eval.encourage3";
