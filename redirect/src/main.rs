use lambda_http::{run, service_fn, tracing, Body, Error, Request, Response};

async fn function_handler(_event: Request) -> Result<Response<Body>, Error> {
    let uri = _event.uri().path();
    let slug: String = slugify(&uri[1..uri.len()]);

    let resp = Response::builder()
        .status(301)
        .header("location", format!("https://mechanicalrock.io/blog/{slug}"))
        .body(format!("Redirected to {}", slug).into())
        .map_err(Box::new)?;
    Ok(resp)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing::init_default_subscriber();

    run(service_fn(function_handler)).await
}

fn slugify(uri: &str) -> String {
    if uri.is_empty() {
        "".to_owned()
    } else {
        let mut slug = uri.replace("/", "-");
        slug.truncate(slug.len() - 5);
        return slug;
    }
}
