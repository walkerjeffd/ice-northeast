<template>
  <div>
    <p>
      If you have questions about this application, discovered any bugs, or are interested in
      using ICE with your own dataset, please feel free to contact us using this form.
    </p>
    <hr>
    <form class="form-horizontal contact" action="https://formspree.io/jeff@walkerenvres.com" method="POST">
      <div class="form-group">
        <label for="inputName" class="col-sm-2 control-label">Name</label>
        <div class="col-sm-10">
          <input type="text" name="name" class="form-control" id="inputName" placeholder="Name">
        </div>
      </div>
      <div class="form-group">
        <label for="inputEmail" class="col-sm-2 control-label">E-mail</label>
        <div class="col-sm-10">
          <input
            type="email"
            name="email"
            class="form-control"
            id="inputEmail"
            placeholder="E-mail">
        </div>
      </div>
      <div class="form-group">
        <label for="inputMessage" class="col-sm-2 control-label">Message</label>
        <div class="col-sm-10">
          <textarea
            name="message"
            class="form-control"
            id="inputMessage"
            rows="8"
            placeholder="Your message"></textarea>
        </div>
      </div>
      <input type="text" name="_gotcha" style="display:none">
      <input type="hidden" name="_subject" value="ICE-SHEDS Contact Submission">
      <div class="form-group">
        <div class="col-sm-offset-2 col-sm-6">
          <input type="submit" class="btn btn-primary" value="Send">
        </div>
      </div>
    </form>
  </div>
</template>
