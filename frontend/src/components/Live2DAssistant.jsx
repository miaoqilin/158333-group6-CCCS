import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display/cubism4";
import api from "../services/api";

window.PIXI = PIXI;

const MODEL_PATH = "/live2d/haru_greeter_pro_jp/runtime/haru_greeter_t05.model3.json";

function Live2DAssistant() {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const modelRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestion, setSuggestion] = useState(
    "Hi! Tell me what you want to eat, and I will recommend something from the menu."
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let destroyed = false;

    const initLive2D = async () => {
      if (!containerRef.current || appRef.current) {
        return;
      }

      try {
        const app = new PIXI.Application({
          width: 260,
          height: 360,
          transparent: true,
          autoStart: true,
        });

        appRef.current = app;
        containerRef.current.appendChild(app.view);

        const model = await Live2DModel.from(MODEL_PATH);

        if (destroyed) {
          model.destroy();
          return;
        }

        modelRef.current = model;

        model.scale.set(0.09);
        model.x = 130;
        model.y = 390;
        model.anchor.set(0.5, 1);

        model.interactive = true;
        model.buttonMode = true;

        model.on("pointertap", () => {
          setOpen(true);
        });

        app.stage.addChild(model);
      } catch (error) {
        console.error("Failed to load Live2D model:", error);
        setSuggestion("Live2D model failed to load. Please check your model path.");
      }
    };

    initLive2D();

    return () => {
      destroyed = true;

      if (modelRef.current) {
        modelRef.current.destroy();
        modelRef.current = null;
      }

      if (appRef.current) {
        appRef.current.destroy(true, {
          children: true,
          texture: true,
          baseTexture: true,
        });
        appRef.current = null;
      }
    };
  }, []);

  const handleAskAssistant = async () => {
    try {
      setOpen(true);
      setLoading(true);

      const cleanQuery = query.trim();

      setSuggestion(
        cleanQuery
          ? "Thinking about your request..."
          : "Please type what you want to eat first."
      );

      if (!cleanQuery) {
        setLoading(false);
        return;
      }

      const { data } = await api.get("/ai/package-suggestion", {
        params: {
          query: cleanQuery,
        },
      });

      const sourceLabel = data.aiSuccess
        ? `AI: ${data.model || "Gemini"}`
        : `Fallback: ${data.aiError || "AI not available"}`;

      setSuggestion(
        `${data.suggestion || "No suggestion available right now."}\n\n[${sourceLabel}]`
      );
    } catch (error) {
      setSuggestion(
        error.response?.data?.message ||
          "Sorry, I could not get an AI suggestion right now."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAskAssistant();
    }
  };

  return (
    <div className="live2d-assistant">
      {open && (
        <div className="live2d-bubble">
          <div className="live2d-bubble-header">
            <strong>AI Package Assistant</strong>
            <button onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="live2d-input-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. I want vegan lunch"
            />
            <button onClick={handleAskAssistant} disabled={loading}>
              Ask
            </button>
          </div>

          <p style={{ whiteSpace: "pre-line" }}>{suggestion}</p>

          <div className="live2d-example-row">
            <button onClick={() => setQuery("I want a cheap lunch package")}>
              Cheap lunch
            </button>
            <button onClick={() => setQuery("I want vegan food")}>
              Vegan food
            </button>
            <button onClick={() => setQuery("I want coffee and dessert")}>
              Coffee dessert
            </button>
          </div>
        </div>
      )}

      <div className="live2d-canvas-wrap" ref={containerRef} />

      <button className="live2d-click-tip" onClick={() => setOpen(true)}>
        Ask AI
      </button>
    </div>
  );
}

export default Live2DAssistant;