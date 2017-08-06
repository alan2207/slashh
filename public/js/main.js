$(document).ready(function() {

    // handling dropdown menu
    $(".dropdown-button").dropdown();


    $(".button-collapse").sideNav();
  // Initialize collapsible (uncomment the line below if you use the dropdown variation)
  //$('.collapsible').collapsible();
        
    // handling modal 
    $('.modal').modal();

    // handle deleting articles
    $('.delete-article').on('click', function(e) {
        $target = $(e.target);
        const id = $target.attr('data-id');
        console.log(id)

        $.ajax({
            type: 'DELETE',
            url: `/articles/${id}`,
            success: function(response) {
                window.location.href = '/';
            },
            error: function(err) {
                console.log(err)
            }
        });
    });

    // initialize markdown editor when textarea is on the page
    if($('textarea').length) {
        var simplemde = new SimpleMDE({
            renderingConfig: {
                codeSyntaxHighlighting: true
            }
        });
    }
});


// initialize highlight.js library
hljs.initHighlightingOnLoad();