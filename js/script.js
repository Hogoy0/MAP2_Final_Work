$(document).ready(function () {
  let score = 0;
  let rainbowActive = false; // 무지개 요정 활성화 여부
  let holdTimeout; // 파란 요정의 클릭 유지 타이머
  let timer; // 게임 타이머
  let gameTime = 60; // 게임 제한 시간 (초)

  // 병에 요정 넣기 함수 (이미지로 추가)
  function addFairyToBottle(bottleId, fairyType) {
    const bottle = document.getElementById(bottleId); // 병의 div 선택
    const fairy = document.createElement("div"); // 요정 div 생성
    fairy.classList.add("fairy", fairyType); // 요정 타입 추가 (yellow, red 등)

    // 병 크기 (250x250)
    const bottleWidth = bottle.offsetWidth;
    const bottleHeight = bottle.offsetHeight;

    // 요정 위치 (병 안에서 랜덤)
    const randomX = Math.random() * (bottleWidth - 50); // 50은 요정 크기
    const randomY = Math.random() * (bottleHeight - 50); // 50은 요정 크기

    // 요정 회전 각도 (0~360도)
    const randomRotation = Math.random() * 360;

    // 랜덤 위치와 회전 각도를 스타일로 적용
    fairy.style.position = "absolute"; // 절대 위치로 설정
    fairy.style.left = `${randomX}px`;
    fairy.style.top = `${randomY}px`;
    fairy.style.transform = `rotate(${randomRotation}deg)`; // 회전 적용

    bottle.appendChild(fairy); // 병에 요정 추가
    console.log("넣었다.");
  }

  // 요정 종류 데이터
  const fairies = [
    { type: "yellow", points: 1 }, // 노란 요정: 클릭 시 점수 추가
    { type: "red", points: 2 }, // 빨간 요정: 더블클릭 필요
    { type: "green", points: 2 }, // 초록 요정: 호버 4회 필요
    { type: "blue", points: 3 }, // 파란 요정: 1초 꾹 클릭
    { type: "rainbow", points: 5 }, // 무지개 요정: 3번 클릭 시 제거
  ];

  // 요정을 랜덤 위치에 나타나게 하는 함수
  function spawnFairy() {
    const fairyData = fairies[Math.floor(Math.random() * fairies.length)];

    // 무지개 요정은 하나만 활성화 가능
    if (fairyData.type === "rainbow" && rainbowActive) {
      return; // 이미 무지개 요정이 활성화된 경우 새로 생성하지 않음
    }

    const fairy = $(
      `<div class="fairy ${fairyData.type}" data-type="${fairyData.type}" data-points="${fairyData.points}" data-removed="false"></div>`
    );
    const gameContainer = $("#game-container");

    const maxX = gameContainer.width() - 200;
    const maxY = gameContainer.height() - 200;

    const posX = Math.random() * maxX;
    const posY = Math.random() * maxY;
    const size = Math.random() * 150 + 50;
    const rotation = Math.random() * 360;

    // 스타일 설정
    fairy.css({
      top: `${posY}px`,
      left: `${posX}px`,
      width: `${size}px`,
      height: `${size}px`,
      transform: `rotate(${rotation}deg)`,
    });

    // 무지개 요정 처리
    if (fairyData.type === "rainbow") {
      fairy.data("teleports", 3); // 3번 이동 가능
      rainbowActive = true; // 무지개 요정 활성화
    }

    $("#fairy-container").append(fairy);

    // 일반 요정 제거 로직 (무지개 요정 제외)
    if (fairyData.type !== "rainbow") {
      setTimeout(() => {
        if (fairy.data("removed") === "true") return; // 이미 제거된 요정인지 확인
        fairy.data("removed", "true");
        fairy.fadeOut(500, () => fairy.remove());
      }, 5000); // 5초 후 페이드 아웃
    }
  }

  // 클릭 이벤트
  $("#fairy-container").on("click", ".fairy", function () {
    const fairy = $(this);

    if (fairy.data("removed") === "true") return; // 이미 제거된 요정인지 확인

    const type = fairy.data("type");

    switch (type) {
      case "yellow": // 노란 요정
        score += fairy.data("points");
        fairy.data("removed", "true");
        fairy.remove();
        addFairyToBottle("yellow-bottle", "yellow");
        break;

      case "red": // 빨간 요정 (더블클릭 필요)
        if (fairy.data("clicked")) {
          score += fairy.data("points");
          fairy.data("removed", "true");
          fairy.remove();
          addFairyToBottle("red-bottle", "red");
        } else {
          fairy.data("clicked", true);
        }
        break;

      case "rainbow": // 무지개 요정 (3번 이동)
        const teleports = fairy.data("teleports");
        if (teleports > 1) {
          fairy.data("teleports", teleports - 1);
          fairy.css({
            top: Math.random() * ($("#game-container").height() - 200),
            left: Math.random() * ($("#game-container").width() - 200),
          });
        } else {
          score += fairy.data("points");
          rainbowActive = false;
          fairy.data("removed", "true");
          fairy.remove();
          addFairyToBottle("rainbow-bottle", "rainbow");
        }
        break;

      default:
        break;
    }

    $("#score").text(score); // 점수 업데이트
  });

  // 파란 요정 꾹 클릭 이벤트
  $("#fairy-container").on("mousedown", ".fairy", function () {
    const fairy = $(this);

    if (fairy.data("type") === "blue") {
      holdTimeout = setTimeout(() => {
        if (fairy.data("removed") === "true") return;
        score += fairy.data("points");
        fairy.data("removed", "true");
        fairy.remove();
        addFairyToBottle("blue-bottle", "blue");
        $("#score").text(score);
      }, 1000); // 1초 동안 유지
    }
  });

  // 마우스 클릭 해제 시 타이머 취소
  $("#fairy-container").on("mouseup mouseleave", ".fairy", function () {
    const fairy = $(this);

    if (fairy.data("type") === "blue") {
      clearTimeout(holdTimeout);
    }
  });

  // 초록 요정 호버 이벤트
  $("#fairy-container").on("mouseenter", ".fairy", function () {
    const fairy = $(this);

    if (fairy.data("type") === "green") {
      let hoverCount = fairy.data("hoverCount") || 4; // 기본값 4로 설정
      if (hoverCount > 1) {
        fairy.data("hoverCount", hoverCount - 1);
      } else if (hoverCount === 1) {
        score += fairy.data("points");
        fairy.data("removed", "true");
        fairy.remove();
        addFairyToBottle("green-bottle", "green");
      }
      $("#score").text(score);
    }
  });

  // 게임 타이머 함수
  function startGameTimer() {
    const timerElement = $("#timer");
    timer = setInterval(() => {
      if (gameTime > 0) {
        gameTime--;
        timerElement.text(`Time Left: ${gameTime}s`);
      } else {
        endGame(); // 시간이 끝나면 게임 종료
      }
    }, 1000); // 1초마다 업데이트
  }

  // 게임 종료 함수
  function endGame() {
    clearInterval(timer); // 타이머 종료
    clearInterval(spawnInterval); // 요정 생성 멈춤
    $("#fairy-container").off(); // 요정 클릭 이벤트 비활성화
    alert(`Game Over! Your final score is ${score}.`); // 최종 점수 표시
  }

  // 게임 시작
  const spawnInterval = setInterval(spawnFairy, 750); // 0.75초마다 요정 생성
  startGameTimer(); // 타이머 시작
});
