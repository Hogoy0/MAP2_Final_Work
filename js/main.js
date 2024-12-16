$(document).ready(function () {
  $(".Button-gamestart").on("click", function () {
    // 이동할 페이지 URL 설정
    window.location.href = "gamepage.html"; // 이동할 페이지 경로
  });
  // 버튼 클릭 이벤트
  $(".Button-description").on("click", function () {
    // 이미지 src 속성 변경
    $(".Title-container img").attr("src", "img/Title_des1.png");

    // .Next-button 동적으로 추가
    if ($(".Next-button").length === 0) {
      // 중복 추가 방지
      $(".Title-container").append('<div class="Next-button"></div>');
    }
  });

  $(document).on("click", ".Next-button", function () {
    // 이미지 src 속성 변경
    $(".Title-container img").attr("src", "img/Title_des2.png");

    // 자기 자신 제거
    $(this).remove();
  });
});
