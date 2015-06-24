define("controllers/registrations_controller",["require","exports","module","libs/utils","jquery"],function(e,t){var n=e("libs/utils"),r=e("jquery");t.init=function(){var e=n.deparam(window.location.href).email;e&&r("#user_email").val(e)}})
;
