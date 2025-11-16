import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { LANDING_PAGE_ROUTES, USER_ROUTES, ADMIN_ROUTES, CENTER_ROUTES, AFFILIATE_ROUTES, AUTH_ROUTES} from '@/config/routes'
import { Role } from '@/types/role'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  /** ------------------------- FETCH ROLE ---------------------------- **/
  let role: Role | null = null

  if (user?.id) {
    const { data } = await supabase.rpc("get_user_role", {
      p_user_id: user.id,
    });

    role = data as Role ?? null;
  } else {
    role = null;
  }

  /** -------------------------  LOGIN REDIRECT ---------------------------- **/
  // unable to access login page, unless signout
  if (user && request.nextUrl.pathname === AUTH_ROUTES.LOGIN) {
    const url = request.nextUrl.clone()
    url.pathname = AUTH_ROUTES.AUTHORIZED
    return NextResponse.redirect(url)
  }

  // redirige a los usuarios autenticados que intentan acceder a /signup
  if (user && request.nextUrl.pathname === AUTH_ROUTES.SIGNUP) {
    const url = request.nextUrl.clone()
    url.pathname = AUTH_ROUTES.AUTHORIZED
    return NextResponse.redirect(url)
  }

  // redirige a los usuarios no autenticados que intentan acceder a /register
  if (!user && request.nextUrl.pathname === AUTH_ROUTES.REGISTER) {
    const url = request.nextUrl.clone()
    url.pathname = AUTH_ROUTES.SIGNUP
    return NextResponse.redirect(url)
  }

  // redirige a los usuarios que intentan acceder a /register si ya tienen un rol asignado
  if (user && request.nextUrl.pathname === AUTH_ROUTES.REGISTER && role !== null) {
    const url = request.nextUrl.clone()
    url.pathname = AUTH_ROUTES.AUTHORIZED
    return NextResponse.redirect(url)
  }


  // no user, potentially respond by redirecting the user to the login page
  if (
    !user &&
    (
      request.nextUrl.pathname.startsWith(USER_ROUTES.OVERVIEW) ||
      request.nextUrl.pathname.startsWith(ADMIN_ROUTES.OVERVIEW) ||
      request.nextUrl.pathname.startsWith(AFFILIATE_ROUTES.OVERVIEW) ||
      request.nextUrl.pathname.startsWith(CENTER_ROUTES.OVERVIEW)
    )
  ) {
    const url = request.nextUrl.clone()
    url.pathname = AUTH_ROUTES.LOGIN
    return NextResponse.redirect(url)
  }

   /** ------------------------- ROLE CHECK ---------------------------- **/

  // if user is authorized and tries to access /authorized, redirect based on role
  if (request.nextUrl.pathname.startsWith(AUTH_ROUTES.AUTHORIZED)) {
    const url = request.nextUrl.clone()

    switch (role) {
      case Role.ADMIN:
        url.pathname = ADMIN_ROUTES.OVERVIEW
        break
      case Role.AFFILIATE:
        url.pathname = AFFILIATE_ROUTES.OVERVIEW
        break
      case Role.CENTER:
        url.pathname = CENTER_ROUTES.OVERVIEW
        break
      case Role.USER:
        url.pathname = USER_ROUTES.OVERVIEW
        break
      case null:
        url.pathname = AUTH_ROUTES.REGISTER
        break;
      default:
        url.pathname = AUTH_ROUTES.LOGIN
    }

    return NextResponse.redirect(url)
  }

  /** ========= Role based access control for dashboard routes ========== **/

  // redirige a los usuarios que intentan acceder a rutas solo para administradores
  if (request.nextUrl.pathname.startsWith(ADMIN_ROUTES.OVERVIEW) && role !== Role.ADMIN) {
    const url = request.nextUrl.clone()
    url.pathname = AUTH_ROUTES.AUTHORIZED
    return NextResponse.redirect(url)
  }

  // redirige a los usuarios que intentan acceder a rutas solo para afiliados
  if (request.nextUrl.pathname.startsWith(AFFILIATE_ROUTES.OVERVIEW) && role !== Role.AFFILIATE) {
    const url = request.nextUrl.clone()
    url.pathname = AUTH_ROUTES.AUTHORIZED
    return NextResponse.redirect(url)
  }

  // redirige a los usuarios que intentan acceder a rutas solo para centros
  if (request.nextUrl.pathname.startsWith(CENTER_ROUTES.OVERVIEW) && role !== Role.CENTER) {
    const url = request.nextUrl.clone()
    url.pathname = AUTH_ROUTES.AUTHORIZED
    return NextResponse.redirect(url)
  }

  // redirige a los usuarios que intentan acceder a rutas solo para usuarios
  if (request.nextUrl.pathname.startsWith(USER_ROUTES.OVERVIEW) && role !== Role.USER) {
    const url = request.nextUrl.clone()
    url.pathname = AUTH_ROUTES.AUTHORIZED
    return NextResponse.redirect(url)
  }

  // redirect logged in users trying to access the landing page to /authorized
  if (request.nextUrl.pathname === LANDING_PAGE_ROUTES.HOME && role !== null) {
    const url = request.nextUrl.clone()
    url.pathname = AUTH_ROUTES.AUTHORIZED
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
