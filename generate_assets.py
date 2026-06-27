import asyncio
import os
from playwright.async_api import async_playwright

async def generate_assets():
    os.makedirs("docs/screenshots", exist_ok=True)
    os.makedirs("docs/assets", exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Record video
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            record_video_dir="docs/"
        )
        page = await context.new_page()

        routes = {
            "Dashboard": "/",
            "Twin": "/twin",
            "Observatory": "/observatory",
            "Outcomes": "/outcomes",
            "War Room": "/war-room",
            "Decision Studio": "/decision-studio",
            "Recovery Center": "/recovery-center",
            "Boardroom": "/boardroom"
        }

        print("Starting capture sequence...")
        
        for name, route in routes.items():
            print(f"Capturing {name}...")
            await page.goto(f"http://localhost:3000{route}")
            # wait for network and animations
            await page.wait_for_timeout(4000)
            await page.screenshot(path=f"docs/screenshots/{name.replace(' ', '_').lower()}.png", full_page=True)
            
            # For architecture assets, take a cropped screenshot if needed, but full page is fine.
            if name in ["Twin", "Observatory", "Outcomes", "Recovery Center"]:
                await page.screenshot(path=f"docs/assets/{name.replace(' ', '_').lower()}_arch.png")
            
        print("Closing context to save video...")
        await context.close()
        
        # Rename video to demo-video.webm
        for file in os.listdir("docs/"):
            if file.endswith(".webm"):
                os.rename(os.path.join("docs", file), "docs/demo-video.webm")
                break
                
        await browser.close()
        print("Assets generated successfully.")

if __name__ == "__main__":
    asyncio.run(generate_assets())
