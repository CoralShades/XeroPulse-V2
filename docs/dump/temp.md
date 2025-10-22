Clone and run locally
You'll first need a Supabase project which can be made via the Supabase dashboard

Create a Next.js app using the Supabase Starter template npx command


npx create-next-app --example with-supabase with-supabase-app

yarn create next-app --example with-supabase with-supabase-app

pnpm create next-app --example with-supabase with-supabase-app
Use cd to change into the app's directory


cd with-supabase-app
Rename .env.example to .env.local and update the following:


NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[INSERT SUPABASE PROJECT API PUBLISHABLE OR ANON KEY]
[!NOTE] This example uses NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, which refers to Supabase's new publishable key format. Both legacy anon keys and new publishable keys can be used with this variable name during the transition period. Supabase's dashboard may show NEXT_PUBLIC_SUPABASE_ANON_KEY; its value can be used in this example. See the full announcement for more information.

Both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY can be found in your Supabase project's API settings

You can now run the Next.js local development server:


npm run dev
The starter kit should now be running on localhost:3000.

This template comes with the default shadcn/ui style initialized. If you instead want other ui.shadcn styles, delete components.json and re-install shadcn/ui

Check out the docs for Local Development to also run Supabase locally.